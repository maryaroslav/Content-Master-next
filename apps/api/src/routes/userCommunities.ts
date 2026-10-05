import { Router, Request, Response } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { UserCommunity, Community } from '../models';
import { logger } from '../lib/logger';

const router = Router();

router.get('/usercommunities', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = currentUserId(req);

        const userCommunities = await UserCommunity.findAll({
            where: { user_id: userId },
            include: {
                model: Community,
                attributes: ['community_id', 'name', 'privacy', 'photo', 'members_count'],
            },
        });

        const communities = userCommunities.map((uc) => uc.Community);
        return res.json(communities);
    } catch (err: unknown) {
        logger.error({ err }, 'Error loading communities');
        return res.status(500).json({ message: 'Server error', err: (err as Error)?.message ?? String(err) });
    }
});

export default router;