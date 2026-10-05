import { Router } from 'express';
import { SearchQuerySchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { withValidation } from '../middlewares/validate';
import * as searchService from '../modules/search/service';

const router = Router();

router.get('/search', requireAuth, withValidation({ query: SearchQuerySchema }, async ({ query }, req, res) => {
    res.json(await searchService.search(query.q, currentUserId(req)));
}));

export default router;
