import { Op, fn, col } from 'sequelize';
import { Attachment, Follow, Message, User, sequelize } from '../../models';
import { AppError } from '../../lib/errors';
import { storage } from '../../storage/storage';
import { deleteFiles, saveImageWithInfo } from '../../storage/images';

const withAttachments = { model: Attachment, as: 'attachments', separate: true, order: [['id', 'ASC']] as [string, string][] };

interface Conversation {
    user: User;
    lastMessageAt: Date | null;
}

type LatestRow = { partner_id: number; last_message_at: Date };

async function latestMessageByPartner(userId: number): Promise<Map<number, Date>> {
    const latest = (direction: 'from_user_id' | 'to_user_id', partner: 'from_user_id' | 'to_user_id') =>
        Message.findAll({
            attributes: [[col(partner), 'partner_id'], [fn('MAX', col('created_at')), 'last_message_at']],
            where: { [direction]: userId },
            group: [partner],
            raw: true,
        }) as unknown as Promise<LatestRow[]>;

    const [sent, received] = await Promise.all([latest('from_user_id', 'to_user_id'), latest('to_user_id', 'from_user_id')]);

    const byPartner = new Map<number, Date>();
    for (const row of [...sent, ...received]) {
        const current = byPartner.get(row.partner_id);
        if (!current || row.last_message_at > current) byPartner.set(row.partner_id, row.last_message_at);
    }
    return byPartner;
}

// Chat partners are the users you follow: those with recent messages first, the rest alphabetically.
export async function listConversations(userId: number): Promise<Conversation[]> {
    const [follows, latest] = await Promise.all([
        Follow.findAll({
            where: { follower_id: userId },
            include: [{ model: User, as: 'Following', attributes: ['user_id', 'username', 'profile_picture'] }],
        }),
        latestMessageByPartner(userId),
    ]);

    return follows
        .flatMap((follow) => (follow.Following ? [{ user: follow.Following, lastMessageAt: latest.get(follow.Following.user_id) ?? null }] : []))
        .sort((a, b) =>
            (b.lastMessageAt?.getTime() ?? -1) - (a.lastMessageAt?.getTime() ?? -1) || a.user.username.localeCompare(b.user.username)
        );
}

export async function listMessages(userId: number, otherUserId: number, { cursor, limit }: { cursor?: number; limit: number }) {
    const where = {
        [Op.and]: [
            {
                [Op.or]: [
                    { from_user_id: userId, to_user_id: otherUserId },
                    { from_user_id: otherUserId, to_user_id: userId },
                ],
            },
            cursor ? { message_id: { [Op.lt]: cursor } } : {},
        ],
    };
    const newest = await Message.findAll({ where, include: [withAttachments], order: [['message_id', 'DESC']], limit: limit + 1 });
    const page = newest.slice(0, limit).reverse();
    return { messages: page, nextCursor: newest.length > limit ? page[0]!.message_id : null };
}

export async function saveAttachment(uploaderId: number, file: Express.Multer.File): Promise<Attachment> {
    const { key, size, width, height } = await saveImageWithInfo(file, 'chat_images');
    try {
        return await Attachment.create({ uploader_id: uploaderId, storage_key: key, mime_type: 'image/webp', size, width, height });
    } catch (err) {
        await deleteFiles([key]);
        throw err;
    }
}

interface NewMessage {
    toUserId: number;
    text?: string | null;
    attachmentIds?: number[];
}

export async function sendMessage(fromUserId: number, { toUserId, text, attachmentIds = [] }: NewMessage): Promise<Message> {
    if (toUserId === fromUserId) throw new AppError(400, 'CANNOT_MESSAGE_SELF', 'You cannot message yourself');
    if (!(await User.findByPk(toUserId, { attributes: ['user_id'] }))) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const content = text?.trim() || null;
    const ids = [...new Set(attachmentIds)];
    if (!content && ids.length === 0) throw new AppError(400, 'EMPTY_MESSAGE', 'The message is empty');

    const messageId = await sequelize.transaction(async (transaction) => {
        // Locked so that two messages sent at once cannot claim the same attachment.
        const attachments = ids.length
            ? await Attachment.findAll({ where: { id: ids, uploader_id: fromUserId, message_id: null }, transaction, lock: transaction.LOCK.UPDATE })
            : [];
        if (attachments.length !== ids.length) {
            throw new AppError(400, 'INVALID_ATTACHMENT', 'The attachment does not exist or was already sent');
        }

        const message = await Message.create(
            { from_user_id: fromUserId, to_user_id: toUserId, content, type: ids.length ? 'image' : 'text' },
            { transaction }
        );
        if (ids.length) await Attachment.update({ message_id: message.message_id }, { where: { id: ids }, transaction });
        return message.message_id;
    });

    return (await Message.findByPk(messageId, { include: [withAttachments] }))!;
}

export const toAttachment = (attachment: Attachment) => ({
    id: attachment.id,
    url: storage.url(attachment.storage_key),
    mimeType: attachment.mime_type,
    size: attachment.size ?? null,
    width: attachment.width ?? null,
    height: attachment.height ?? null,
});

export const toChatMessage = (message: Message) => ({
    id: message.message_id,
    fromUserId: message.from_user_id,
    toUserId: message.to_user_id,
    content: message.content ?? null,
    attachments: (message.attachments ?? []).map(toAttachment),
    type: message.type,
    createdAt: message.created_at,
});
