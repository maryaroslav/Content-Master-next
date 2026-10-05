import { Router } from 'express';
import { SearchQuerySchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { withValidation } from '../middlewares/validate';
import * as searchService from '../modules/search/service';
import { legacyCommunity } from './legacyFormat';

const router = Router();

router.get('/search', requireAuth, withValidation({ query: SearchQuerySchema }, async ({ query }, req, res) => {
    const { users, communities } = await searchService.search(query.q, currentUserId(req));
    res.json({ users, communities: communities.map(legacyCommunity) });
}));

export default router;
