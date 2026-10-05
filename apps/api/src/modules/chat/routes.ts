import { Router } from 'express';
import { PaginationQuerySchema, UserIdParamsSchema } from '@cm/contracts';
import { chatImageUpload } from '../../middlewares/uploads';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import { AppError } from '../../lib/errors';
import * as chatService from './service';

const router = Router();

router.use(requireAuth);

router.get('/conversations', async (req, res) => {
    const conversations = await chatService.listConversations(currentUserId(req));
    res.json(conversations.map(({ user, lastMessageAt }) => ({
        user: { id: user.user_id, username: user.username, profilePicture: user.profile_picture ?? null },
        lastMessageAt,
    })));
});

router.get('/conversations/:userId/messages', withValidation({ params: UserIdParamsSchema, query: PaginationQuerySchema }, async ({ params, query }, req, res) => {
    const { messages, nextCursor } = await chatService.listMessages(currentUserId(req), params.userId, query);
    res.json({
        items: messages.map((message) => ({
            id: message.message_id,
            fromUserId: message.from_user_id,
            toUserId: message.to_user_id,
            content: message.content ?? null,
            mediaUrl: message.media_url ?? null,
            type: message.type,
            createdAt: message.created_at,
        })),
        nextCursor,
    });
}));

router.post('/attachments', chatImageUpload.single('image'), (req, res) => {
    if (!req.file) throw new AppError(400, 'VALIDATION_ERROR', 'No file uploaded');
    res.status(201).json({ url: chatService.attachmentUrl(req.file) });
});

export default router;
