import type { User as UserDto, UserProfile as UserProfileDto } from '@cm/contracts';
import type { User } from '../../models';
import { publicUrl } from '../../storage/storage';

// Dates are still `Date` objects here; they become strings in the JSON response.
type SerializableUser = Omit<UserDto, 'createdAt'> & { createdAt: Date };

export function toUserDto(user: User): SerializableUser {
    return {
        id: user.user_id,
        username: user.username,
        email: user.email,
        fullName: user.full_name ?? null,
        bio: user.bio ?? null,
        profilePicture: publicUrl(user.profile_picture),
        role: user.role,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        createdAt: user.created_at,
    };
}

export function toUserProfileDto(user: User, followersCount: number, isFollowing: boolean): UserProfileDto {
    return {
        id: user.user_id,
        username: user.username,
        fullName: user.full_name ?? null,
        bio: user.bio ?? null,
        profilePicture: publicUrl(user.profile_picture),
        followersCount,
        isFollowing,
    };
}
