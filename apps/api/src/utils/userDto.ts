import type { User } from '../models/User';

export interface PublicUserDto {
    user_id: number;
    username: string;
    email: string;
    full_name: string | null;
    bio: string | null;
    profile_picture: string | null;
    role: string;
    twoFactorEnabled: boolean;
    created_at?: Date;
}

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
