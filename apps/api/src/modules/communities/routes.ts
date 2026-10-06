import type { Router } from 'express';
import { communityEndpoints } from '@cm/contracts';
import { currentUserId } from '../../middlewares/requireAuth';
import { mount } from '../mount';
import { toCommunityDto } from './mapper';
import * as communitiesService from './service';

export function mountCommunityRoutes(router: Router): void {
    mount(router, communityEndpoints.listOwned, async (_input, req) =>
        (await communitiesService.listOwnedCommunities(currentUserId(req))).map(toCommunityDto)
    );

    mount(router, communityEndpoints.create, async ({ body }, req) =>
        toCommunityDto(await communitiesService.createCommunity(currentUserId(req), body, req.file))
    );

    mount(router, communityEndpoints.join, async ({ params }, req) => communitiesService.join(currentUserId(req), params.communityId));

    mount(router, communityEndpoints.leave, async ({ params }, req) => communitiesService.leave(currentUserId(req), params.communityId));
}
