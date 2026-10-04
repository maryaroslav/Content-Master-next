import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import { Follow } from '../models';
import { logger } from '../lib/logger';

const router = Router();

function getReqUserId(req: Request): number | null {
    const u = (req as any).user;
    if (!u) return null;
    if (typeof u === 'string') {
        try {
            const parsed = JSON.parse(u);
            return parsed?.user_id ?? null;
        } catch {
            return null;
        }
    }
    return (u as any).user_id ?? null;
}

router.post('/follow/:userId', authToken, async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const followerId = getReqUserId(req);
        if (!followerId) return res.status(401).json({ message: 'Unauthorized' });

        const followingId = parseInt(req.params.userId, 10);
        if (Number.isNaN(followingId)) return res.status(400).json({ message: 'Invalid userId' });

        const [follow, created] = await Follow.findOrCreate({
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
});

router.post('/unfollow/:userId', authToken, async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const followerId = getReqUserId(req);
        if (!followerId) return res.status(401).json({ message: 'Unauthorized' });

        const followingId = parseInt(req.params.userId, 10);
        if (Number.isNaN(followingId)) return res.status(400).json({ message: 'Invalid userId' });

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
});

router.get('/status/:userId', authToken, async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const followerId = getReqUserId(req);
        if (!followerId) return res.status(401).json({ message: 'Unauthorized' });

        const followingId = parseInt(req.params.userId, 10);
        if (Number.isNaN(followingId)) return res.status(400).json({ message: 'Invalid userId' });

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
});

export default router;