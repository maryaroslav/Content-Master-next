import type { Transaction } from 'sequelize';
import type { CreateCommunityRequest } from '@cm/contracts';
import { sequelize, Community, UserCommunity } from '../../models';
import { AppError } from '../../lib/errors';

const SUMMARY_ATTRIBUTES = ['community_id', 'name', 'privacy', 'photo', 'members_count'];

// Counted instead of incremented, so the stored number cannot drift from the actual rows.
async function recountMembers(communityId: number, transaction: Transaction): Promise<number> {
    const membersCount = await UserCommunity.count({ where: { community_id: communityId }, transaction });
    await Community.update({ members_count: membersCount }, { where: { community_id: communityId }, transaction });
    return membersCount;
}

async function lockCommunity(communityId: number, transaction: Transaction): Promise<Community> {
    const community = await Community.findByPk(communityId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!community) throw new AppError(404, 'COMMUNITY_NOT_FOUND', 'Community not found');
    return community;
}

export async function createCommunity(ownerId: number, input: CreateCommunityRequest, photo: Express.Multer.File | undefined) {
    if (!photo) throw new AppError(400, 'VALIDATION_ERROR', 'Community photo is required');

    return sequelize.transaction(async (transaction) => {
        const community = await Community.create(
            {
                name: input.name,
                privacy: input.privacy,
                theme: input.theme,
                description: input.description ?? null,
                photo: photo.filename,
                owner_id: ownerId,
                members_count: 1,
            },
            { transaction }
        );
        await UserCommunity.create({ user_id: ownerId, community_id: community.community_id }, { transaction });
        return community;
    });
}

export function listOwnedCommunities(ownerId: number) {
    return Community.findAll({ where: { owner_id: ownerId }, order: [['community_id', 'DESC']] });
}

export async function listMemberCommunities(userId: number) {
    const memberships = await UserCommunity.findAll({
        where: { user_id: userId },
        include: { model: Community, attributes: SUMMARY_ATTRIBUTES },
    });
    return memberships.flatMap((membership) => (membership.Community ? [membership.Community] : []));
}

export function join(userId: number, communityId: number) {
    return sequelize.transaction(async (transaction) => {
        const community = await lockCommunity(communityId, transaction);
        if (community.privacy === 'private' && community.owner_id !== userId) {
            throw new AppError(403, 'PRIVATE_COMMUNITY', 'This community is private');
        }

        await UserCommunity.findOrCreate({ where: { user_id: userId, community_id: communityId }, transaction });
        return { isMember: true, membersCount: await recountMembers(communityId, transaction) };
    });
}

export function leave(userId: number, communityId: number) {
    return sequelize.transaction(async (transaction) => {
        const community = await lockCommunity(communityId, transaction);
        if (community.owner_id === userId) {
            throw new AppError(400, 'OWNER_CANNOT_LEAVE', 'The owner cannot leave their own community');
        }

        await UserCommunity.destroy({ where: { user_id: userId, community_id: communityId }, transaction });
        return { isMember: false, membersCount: await recountMembers(communityId, transaction) };
    });
}
