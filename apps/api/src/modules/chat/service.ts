import { Op, fn, col } from 'sequelize';
import { Follow, Message, User } from '../../models';
import { storage } from '../../storage/storage';
import { saveImage } from '../../storage/images';

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
    const include = [{ model: User, as: 'FromUser', attributes: ['user_id', 'username', 'profile_picture'] }];

    const newest = await Message.findAll({ where, include, order: [['message_id', 'DESC']], limit: limit + 1 });
    const page = newest.slice(0, limit).reverse();
    return { messages: page, nextCursor: newest.length > limit ? page[0]!.message_id : null };
}

export async function saveAttachment(file: Express.Multer.File): Promise<string> {
    return storage.url(await saveImage(file, 'chat_images'));
}

export const toChatMessage = (message: Message) => ({
    id: message.message_id,
    fromUserId: message.from_user_id,
    toUserId: message.to_user_id,
    content: message.content ?? null,
    mediaUrl: message.media_url ?? null,
    type: message.type,
    createdAt: message.created_at,
});
