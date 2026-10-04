import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import authToken from '../middlewares/authToken';

const router = Router();

const { User, Community } = db as any;

router.get('/search', authToken, async (req: Request, res: Response) => {
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const userId = (req as any).user?.user_id ?? null;

    try {
        const users = await User.findAll({
            where: {
                username: { [Op.like]: `%${q}%` },
                user_id: { [Op.ne]: userId },
            },
            attributes: ['user_id', 'username', 'bio', 'profile_picture'],
        });

        const communities = await Community.findAll({
            where: {
                name: { [Op.like]: `%${q}%` },
                owner_id: { [Op.ne]: userId },
            },
            attributes: ['community_id', 'name', 'privacy', 'photo', 'members_count'],
        });

        return res.json({ users, communities });
    } catch (err) {
        console.error('Search error:', err);
        return res.status(500).json({ message: 'Search error' });
    }
});

export default router;
