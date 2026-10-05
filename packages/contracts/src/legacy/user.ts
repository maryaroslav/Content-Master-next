import { z } from 'zod';
import { DateTimeSchema } from '../common';
import { UsernameSchema } from '../user';

export { UsernameSchema };

export const PublicUserSchema = z.object({
    user_id: z.number().int(),
    username: z.string(),
    email: z.string(),
    full_name: z.string().nullable(),
    bio: z.string().nullable(),
    profile_picture: z.string().nullable(),
    role: z.string(),
    twoFactorEnabled: z.boolean(),
    created_at: DateTimeSchema.optional(),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const UserProfileSchema = z.object({
    user_id: z.number().int(),
    username: z.string(),
    full_name: z.string().nullable(),
    bio: z.string().nullable(),
    profile_picture: z.string().nullable(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UsernameParamsSchema = z.object({
    username: z.string().min(1).max(50),
});
export type UsernameParams = z.infer<typeof UsernameParamsSchema>;
