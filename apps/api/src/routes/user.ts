import { Router, Request, Response } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { User } from '../models';
import userCommunitiesRoutes from './userCommunities';
import userEventsRoutes from './userEvents';
import { UsernameParamsSchema } from '@cm/contracts';
import { logger } from '../lib/logger';
import { toPublicUser } from '../utils/userDto';
import { withValidation } from '../middlewares/validate';

const router = Router();


router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(currentUserId(req));

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(toPublicUser(user));
    } catch (error) {
        logger.error({ err: error }, '[user] Request failed');
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/byusername/:username', requireAuth, withValidation({ params: UsernameParamsSchema }, async ({ params }, _req, res) => {
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