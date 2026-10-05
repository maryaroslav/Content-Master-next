import { Router } from 'express';
import { CreateCommunityRequestSchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { imageUpload } from '../middlewares/upload';
import { withValidation } from '../middlewares/validate';
import * as communitiesService from '../modules/communities/service';

const router = Router();

router.post('/createcommunity', requireAuth, imageUpload.single('photo'), withValidation({ body: CreateCommunityRequestSchema }, async ({ body }, req, res) => {
    const community = await communitiesService.createCommunity(currentUserId(req), body, req.file);
    res.status(201).json({ message: 'Community created successfully', community });
}));

router.get('/mycommunities', requireAuth, async (req, res) => {
    res.json(await communitiesService.listOwnedCommunities(currentUserId(req)));
});

export default router;
