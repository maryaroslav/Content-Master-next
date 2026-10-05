import { Router, Request, Response } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { UserEvent, Event } from '../models';
import { logger } from '../lib/logger';

const router = Router();

router.get('/userevents', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = currentUserId(req);

        const userEvents = await UserEvent.findAll({
            where: { user_id: userId },
            include: {
                model: Event,
                attributes: ['event_id', 'title', 'image', 'created_at', 'members_count'],
            },
        });

        const events = userEvents.map((ue) => ue.Event);
        return res.json(events);
    } catch (err: unknown) {
        logger.error({ err }, 'Error loading events');
        return res.status(500).json({ message: 'Server error', err: (err as Error)?.message ?? String(err) });
    }
});

export default router;