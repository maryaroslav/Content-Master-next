import { Router, Request } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { Follow } from '../models';
import { UserIdParamsSchema } from '@cm/contracts';
import { logger } from '../lib/logger';
import { withValidation } from '../middlewares/validate';

const router = Router();

router.post('/follow/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    try {
        const followerId = currentUserId(req);

        const followingId = params.userId;

        const [, created] = await Follow.findOrCreate({
            where: {
                follower_id: followerId,
                following_id: followingId,
            },
        });

        res.json({ success: true, created });
    } catch (err) {
        logger.error({ err }, '[follow/follow] Error');
        res.status(500).json({ message: 'Internal server error' });
    }
}));

router.post('/unfollow/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    try {
        const followerId = currentUserId(req);

        const followingId = params.userId;

        const result = await Follow.destroy({
            where: {
                follower_id: followerId,
                following_id: followingId,
            },
        });

        res.json({ success: true, removed: result > 0 });
    } catch (err) {
        logger.error({ err }, '[follow/unfollow] Error');
        res.status(500).json({ message: 'Internal server error' });
    }
}));

router.get('/status/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    try {
        const followerId = currentUserId(req);

        const followingId = params.userId;

        const isFollowing = await Follow.findOne({
            where: {
                follower_id: followerId,
                following_id: followingId,
            },
        });

        res.json({ isFollowing: !!isFollowing });
    } catch (err) {
        logger.error({ err }, '[follow/status] Error');
        res.status(500).json({ message: 'Internal server error' });
    }
}));

export default router;