import { Router } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import * as eventsService from '../modules/events/service';
import { legacyEvent } from './legacyFormat';

const router = Router();

router.get('/userevents', requireAuth, async (req, res) => {
    res.json((await eventsService.listMemberEvents(currentUserId(req))).map(legacyEvent));
});

export default router;
