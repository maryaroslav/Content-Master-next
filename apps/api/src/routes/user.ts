import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import { User } from '../models';
import userCommunitiesRoutes from './userCommunities';
import userEventsRoutes from './userEvents';
import { UsernameParamsSchema } from '@cm/contracts';
import { logger } from '../lib/logger';
import { toPublicUser } from '../utils/userDto';
import { withValidation } from '../middlewares/validate';

const router = Router();

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

        return res.json(toPublicUser(user));
    } catch (error) {
        logger.error({ err: error }, '[user] Request failed');
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/byusername/:username', authToken, withValidation({ params: UsernameParamsSchema }, async ({ params }, _req, res) => {
    try {
        const user = await User.findOne({
            where: { username: params.username },
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
        logger.error({ err }, '[user] Request failed');
        return res.status(500).json({ message: 'Internal server error' });
    }
}));

router.use(userCommunitiesRoutes);
router.use(userEventsRoutes);

export default router;