import { Router } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import * as eventsService from '../modules/events/service';

const router = Router();

router.get('/userevents', requireAuth, async (req, res) => {
    res.json(await eventsService.listMemberEvents(currentUserId(req)));
});

export default router;
