import type { PublicUser } from '@cm/contracts/legacy';
import type { User } from '../models/User';

// Dates are still `Date` objects here; they become strings in the JSON response.
type PublicUserDto = Omit<PublicUser, 'created_at'> & { created_at?: Date };

export function toPublicUser(user: User): PublicUserDto {
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name ?? null,
        bio: user.bio ?? null,
        profile_picture: user.profile_picture ?? null,
        role: user.role,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        created_at: user.created_at,
    };
}
