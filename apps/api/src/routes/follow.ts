import { Router } from 'express';
import { UserIdParamsSchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { withValidation } from '../middlewares/validate';
import * as usersService from '../modules/users/service';

const router = Router();

router.post('/follow/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    const { created } = await usersService.follow(currentUserId(req), params.userId);
    res.json({ success: true, created });
}));

router.post('/unfollow/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    const { removed } = await usersService.unfollow(currentUserId(req), params.userId);
    res.json({ success: true, removed });
}));

router.get('/status/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    const { isFollowing } = await usersService.getFollowStatus(currentUserId(req), params.userId);
    res.json({ isFollowing });
}));

export default router;
