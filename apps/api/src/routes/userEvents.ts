import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import db from '../models';

const router = Router();
const { UserEvent, Event } = db as any;

function getReqUserId(req: Request): number | null {
    const u = (req as any).user;
    if (!u) return null;
    if (typeof u === 'string') {
        try {
            const parsed = JSON.parse(u);
            return parsed?.user_id ?? null;
        } catch {
            return null;
        }
    }
    return (u as any).user_id ?? null;
}

router.get('/userevents', authToken, async (req: Request, res: Response) => {
    try {
        const userId = getReqUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userEvents = await UserEvent.findAll({
            where: { user_id: userId },
            include: {
                model: Event,
                attributes: ['event_id', 'title', 'image', 'created_at', 'members_count'],
            },
        });

        const events = userEvents.map((uc: any) => uc.Event);
        return res.json(events);
    } catch (err: unknown) {
        console.error('Error loading events: ', err);
        return res.status(500).json({ message: 'Server error', err: (err as Error)?.message ?? String(err) });
    }
});

export default router;