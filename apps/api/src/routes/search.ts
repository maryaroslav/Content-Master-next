import { Router } from 'express';
import { Op } from 'sequelize';
import { User, Community } from '../models';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { SearchQuerySchema } from '@cm/contracts/legacy';
import { logger } from '../lib/logger';
import { withValidation } from '../middlewares/validate';

const router = Router();

router.get('/search', requireAuth, withValidation({ query: SearchQuerySchema }, async ({ query }, req, res) => {
    const q = query.q.toLowerCase();
    const userId = currentUserId(req);

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
        logger.error({ err }, 'Search error');
        return res.status(500).json({ message: 'Search error' });
    }
}));

export default router;
