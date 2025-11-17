import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import db from '../models';

const router = Router();
const { UserCommunity, Community } = db as any;

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

router.get('/usercommunities', authToken, async (req: Request, res: Response) => {
    try {
        const userId = getReqUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        console.log('User ID:', userId);

        const userCommunities = await UserCommunity.findAll({
            where: { user_id: userId },
            include: {
                model: Community,
                attributes: ['community_id', 'name', 'privacy', 'photo', 'members_count'],
            },
        });

        if (!userCommunities || userCommunities.length === 0) {
            console.log('No communities found for user:', userId);
        } else {
            console.log('Communities found:', userCommunities.length);
        }

        const communities = userCommunities.map((uc: any) => uc.Community);
        return res.json(communities);
    } catch (err: unknown) {
        console.error('Error loading communities: ', err);
        return res.status(500).json({ message: 'Server error', err: (err as Error)?.message ?? String(err) });
    }
});

export default router;