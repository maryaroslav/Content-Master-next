import { Router } from 'express';
import { UsernameParamsSchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { withValidation } from '../middlewares/validate';
import { toPublicUser } from '../utils/userDto';
import * as usersService from '../modules/users/service';
import userCommunitiesRoutes from './userCommunities';
import userEventsRoutes from './userEvents';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
    res.json(toPublicUser(await usersService.getUser(currentUserId(req))));
});

router.get('/byusername/:username', requireAuth, withValidation({ params: UsernameParamsSchema }, async ({ params }, _req, res) => {
    const user = await usersService.getUserByUsername(params.username);
    res.json({
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        bio: user.bio,
        profile_picture: user.profile_picture,
    });
}));

router.use(userCommunitiesRoutes);
router.use(userEventsRoutes);

export default router;
