import { Router } from 'express';
import { UserIdParamsSchema, UsernameParamsSchema } from '@cm/contracts';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import { toUserDto, toUserProfileDto } from './mapper';
import * as usersService from './service';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req, res) => {
    res.json(toUserDto(await usersService.getUser(currentUserId(req))));
});

router.get('/by-username/:username', withValidation({ params: UsernameParamsSchema }, async ({ params }, req, res) => {
    const { user, followersCount, isFollowing } = await usersService.getProfile(params.username, currentUserId(req));
    res.json(toUserProfileDto(user, followersCount, isFollowing));
}));

router.put('/:userId/follow', withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    const viewerId = currentUserId(req);
    await usersService.follow(viewerId, params.userId);
    res.json(await usersService.getFollowStatus(viewerId, params.userId));
}));

router.delete('/:userId/follow', withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    const viewerId = currentUserId(req);
    await usersService.unfollow(viewerId, params.userId);
    res.json(await usersService.getFollowStatus(viewerId, params.userId));
}));

export default router;
