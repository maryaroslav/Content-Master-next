import type { Router } from 'express';
import { searchEndpoints } from '@cm/contracts';
import { currentUserId } from '../../middlewares/requireAuth';
import { publicUrl, storage } from '../../storage/storage';
import { mount } from '../mount';
import * as searchService from './service';

const RESULTS_PER_TYPE = 20;

export function mountSearchRoutes(router: Router): void {
    mount(router, searchEndpoints.search, async ({ query }, req) => {
        const viewerId = currentUserId(req);
        const { users, communities } = await searchService.search(query.q, viewerId, RESULTS_PER_TYPE);
        const memberOf = await searchService.memberCommunityIds(viewerId, communities.map((c) => c.community_id));
        return {
            users: users.map((user) => ({
                id: user.user_id,
                username: user.username,
                bio: user.bio ?? null,
                profilePicture: publicUrl(user.profile_picture),
            })),
            communities: communities.map((community) => ({
                id: community.community_id,
                name: community.name,
                privacy: community.privacy,
                photo: storage.url(community.photo),
                membersCount: community.members_count,
                isMember: memberOf.has(community.community_id),
            })),
        };
    });
}
