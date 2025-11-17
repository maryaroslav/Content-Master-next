import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import db from '../models';

const router = Router();
const { Follow } = db as any;

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

router.post('/follow/:userId', authToken, async (req: Request, res: Response) => {
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
        console.error('[follow/follow] Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/unfollow/:userId', authToken, async (req: Request, res: Response) => {
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
        console.error('[follow/unfollow] Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/status/:userId', authToken, async (req: Request, res: Response) => {
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
        console.error('[follow/status] Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;