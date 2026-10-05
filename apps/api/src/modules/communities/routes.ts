import { Router } from 'express';
import { CommunityIdParamsSchema, CommunityListQuerySchema, CreateCommunityRequestSchema } from '@cm/contracts';
import { communityPhotoUpload } from '../../middlewares/uploads';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import { toCommunityDto } from './mapper';
import * as communitiesService from './service';

const router = Router();

router.use(requireAuth);

router.get('/', withValidation({ query: CommunityListQuerySchema }, async (_input, req, res) => {
    const communities = await communitiesService.listOwnedCommunities(currentUserId(req));
    res.json(communities.map(toCommunityDto));
}));

router.post('/', communityPhotoUpload.single('photo'), withValidation({ body: CreateCommunityRequestSchema }, async ({ body }, req, res) => {
    const community = await communitiesService.createCommunity(currentUserId(req), body, req.file);
    res.status(201).json(toCommunityDto(community));
}));

router.post('/:communityId/membership', withValidation({ params: CommunityIdParamsSchema }, async ({ params }, req, res) => {
    res.json(await communitiesService.join(currentUserId(req), params.communityId));
}));

router.delete('/:communityId/membership', withValidation({ params: CommunityIdParamsSchema }, async ({ params }, req, res) => {
    res.json(await communitiesService.leave(currentUserId(req), params.communityId));
}));

export default router;
