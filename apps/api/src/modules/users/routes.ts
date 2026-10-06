import type { Router } from 'express';
import { userEndpoints } from '@cm/contracts';
import { currentUserId } from '../../middlewares/requireAuth';
import { authRateLimit } from '../../middlewares/rateLimit';
import { storage } from '../../storage/storage';
import { toCommunitySummary } from '../communities/mapper';
import * as communitiesService from '../communities/service';
import * as eventsService from '../events/service';
import { mount } from '../mount';
import { toUserDto, toUserProfileDto } from './mapper';
import * as usersService from './service';

export function mountUserRoutes(router: Router): void {
    mount(router, userEndpoints.me, async (_input, req) => toUserDto(await usersService.getUser(currentUserId(req))));

    mount(router, userEndpoints.updateMe, async ({ body }, req) =>
        toUserDto(await usersService.updateProfile(currentUserId(req), body))
    );

    mount(
        router,
        userEndpoints.changeEmail,
        async ({ body }, req) => toUserDto(await usersService.changeEmail(currentUserId(req), body)),
        { before: [authRateLimit] }
    );

    mount(router, userEndpoints.uploadAvatar, async (_input, req) =>
        toUserDto(await usersService.setAvatar(currentUserId(req), req.file))
    );

    mount(router, userEndpoints.deleteAvatar, async (_input, req) => toUserDto(await usersService.deleteAvatar(currentUserId(req))));

    mount(router, userEndpoints.myCommunities, async (_input, req) =>
        (await communitiesService.listMemberCommunities(currentUserId(req))).map(toCommunitySummary)
    );

    mount(router, userEndpoints.myEvents, async (_input, req) =>
        (await eventsService.listMemberEvents(currentUserId(req))).map((event) => ({
            id: event.event_id,
            title: event.title,
            image: storage.url(event.image),
            createdAt: event.created_at,
            membersCount: event.members_count ?? null,
        }))
    );

    mount(router, userEndpoints.profile, async ({ params }, req) => {
        const { user, followersCount, isFollowing } = await usersService.getProfile(params.username, currentUserId(req));
        return toUserProfileDto(user, followersCount, isFollowing);
    });

    mount(router, userEndpoints.follow, async ({ params }, req) => {
        const viewerId = currentUserId(req);
        await usersService.follow(viewerId, params.userId);
        return usersService.getFollowStatus(viewerId, params.userId);
    });

    mount(router, userEndpoints.unfollow, async ({ params }, req) => {
        const viewerId = currentUserId(req);
        await usersService.unfollow(viewerId, params.userId);
        return usersService.getFollowStatus(viewerId, params.userId);
    });
}
