import { Op } from 'sequelize';
import { User, Community, UserCommunity } from '../../models';

// `%` and `_` typed by the user must match literally, not act as LIKE wildcards.
const containing = (q: string) => `%${q.replace(/[\\%_]/g, '\\$&')}%`;

export async function search(q: string, viewerId: number, limit: number) {
    const [users, communities] = await Promise.all([
        User.findAll({
            where: { username: { [Op.like]: containing(q) }, user_id: { [Op.ne]: viewerId } },
            attributes: ['user_id', 'username', 'bio', 'profile_picture'],
            order: [['username', 'ASC']],
            limit,
        }),
        Community.findAll({
            where: { name: { [Op.like]: containing(q) }, owner_id: { [Op.ne]: viewerId } },
            attributes: ['community_id', 'name', 'privacy', 'photo', 'members_count'],
            order: [['name', 'ASC']],
            limit,
        }),
    ]);
    return { users, communities };
}

export async function memberCommunityIds(viewerId: number, communityIds: number[]): Promise<Set<number>> {
    if (!communityIds.length) return new Set();
    const memberships = await UserCommunity.findAll({
        where: { user_id: viewerId, community_id: communityIds },
        attributes: ['community_id'],
    });
    return new Set(memberships.map((m) => m.community_id));
}
