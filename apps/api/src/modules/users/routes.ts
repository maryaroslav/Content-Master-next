import { Router } from 'express';
import { UserIdParamsSchema, UsernameParamsSchema } from '@cm/contracts';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import { toUserDto, toUserProfileDto } from './mapper';
import * as usersService from './service';
import * as communitiesService from '../communities/service';
import * as eventsService from '../events/service';
import { toCommunitySummary } from '../communities/mapper';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req, res) => {
    res.json(toUserDto(await usersService.getUser(currentUserId(req))));
});

router.get('/me/communities', async (req, res) => {
    const communities = await communitiesService.listMemberCommunities(currentUserId(req));
    res.json(communities.map(toCommunitySummary));
});

router.get('/me/events', async (req, res) => {
    const events = await eventsService.listMemberEvents(currentUserId(req));
    res.json(events.map((event) => ({
        id: event.event_id,
        title: event.title,
        image: event.image,
        createdAt: event.created_at,
        membersCount: event.members_count ?? null,
    })));
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
