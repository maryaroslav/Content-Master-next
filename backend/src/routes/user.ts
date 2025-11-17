import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import db from '../models';
import userCommunitiesRoutes from './userCommunities';
import userEventsRoutes from './userEvents';

const router = Router();
const { User } = db as any;

function getReqUser(req: Request): { email?: string } | null {
    const u = (req as any).user;
    if (!u) return null;
    if (typeof u === 'string') {
        try {
            return JSON.parse(u);
        } catch {
            return null;
        }
    }
    return u as any;
}

router.get('/me', authToken, async (req: Request, res: Response) => {
    try {
        const userPayload = getReqUser(req);
        if (!userPayload?.email) {
            return res.status(401).json({ message: 'Unauthorized: Invalid user data' });
        }

        const user = await User.findOne({
            where: { email: userPayload.email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            bio: user.bio,
            profile_picture: user.profile_picture,
            created_at: user.created_at,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/byusername/:username', authToken, async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({
            where: { username: req.params.username },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json({
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            bio: user.bio,
            profile_picture: user.profile_picture,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.use(userCommunitiesRoutes);
router.use(userEventsRoutes);

export default router;