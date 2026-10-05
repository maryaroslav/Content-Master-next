import { Router } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import * as communitiesService from '../modules/communities/service';
import { legacyCommunity } from './legacyFormat';

const router = Router();

router.get('/usercommunities', requireAuth, async (req, res) => {
    res.json((await communitiesService.listMemberCommunities(currentUserId(req))).map(legacyCommunity));
});

export default router;
