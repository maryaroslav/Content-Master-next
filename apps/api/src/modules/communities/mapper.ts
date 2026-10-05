import type { Community as CommunityDto, CommunitySummary } from '@cm/contracts';
import type { Community } from '../../models';

// Dates are still `Date` objects here; they become strings in the JSON response.
type SerializableCommunity = Omit<CommunityDto, 'createdAt' | 'updatedAt'> & { createdAt: Date; updatedAt: Date };

export function toCommunityDto(community: Community): SerializableCommunity {
    return {
        id: community.community_id,
        name: community.name,
        privacy: community.privacy,
        description: community.description ?? null,
        photo: community.photo,
        ownerId: community.owner_id,
        membersCount: community.members_count,
        theme: community.theme,
        createdAt: community.created_at,
        updatedAt: community.updated_at,
    };
}

export function toCommunitySummary(community: Community): CommunitySummary {
    return {
        id: community.community_id,
        name: community.name,
        privacy: community.privacy,
        photo: community.photo,
        membersCount: community.members_count,
    };
}
