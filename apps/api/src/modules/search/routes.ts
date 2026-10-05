import { Router } from 'express';
import { SearchQuerySchema } from '@cm/contracts';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import * as searchService from './service';
import { publicUrl, storage } from '../../storage/storage';

const RESULTS_PER_TYPE = 20;

const router = Router();

router.get('/', requireAuth, withValidation({ query: SearchQuerySchema }, async ({ query }, req, res) => {
    const { users, communities } = await searchService.search(query.q, currentUserId(req), RESULTS_PER_TYPE);
    res.json({
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
        })),
    });
}));

export default router;
