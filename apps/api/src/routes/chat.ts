import { Router } from 'express';
import { UserIdParamsSchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { chatImageUpload } from '../middlewares/uploads';
import { withValidation } from '../middlewares/validate';
import { AppError } from '../lib/errors';
import * as chatService from '../modules/chat/service';

const router = Router();

router.get('/following', requireAuth, async (req, res) => {
    const conversations = await chatService.listConversations(currentUserId(req));
    res.json(conversations.map(({ user, lastMessageAt }) => ({
        user_id: user.user_id,
        username: user.username,
        profile_picture: user.profile_picture,
        last_message_time: lastMessageAt,
    })));
});

router.get('/message/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    const { messages } = await chatService.listMessages(currentUserId(req), params.userId);
    res.json(messages);
}));

router.post('/upload', requireAuth, chatImageUpload.single('image'), (req, res) => {
    if (!req.file) throw new AppError(400, 'VALIDATION_ERROR', 'No file uploaded');
    res.json({ url: chatService.attachmentUrl(req.file) });
});

export default router;
