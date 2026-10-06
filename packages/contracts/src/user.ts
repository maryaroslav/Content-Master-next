import { z } from 'zod';
import { DateTimeSchema, IdSchema } from './common';

export const UsernameSchema = z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be at most 50 characters long')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username may contain only letters, digits, ".", "_" and "-"');

export const UserSchema = z.object({
    id: z.number().int(),
    username: z.string(),
    email: z.string(),
    fullName: z.string().nullable(),
    bio: z.string().nullable(),
    profilePicture: z.string().nullable(),
    role: z.string(),
    twoFactorEnabled: z.boolean(),
    createdAt: DateTimeSchema,
});
export type User = z.infer<typeof UserSchema>;

export const UserProfileSchema = z.object({
    id: z.number().int(),
    username: z.string(),
    fullName: z.string().nullable(),
    bio: z.string().nullable(),
    profilePicture: z.string().nullable(),
    followersCount: z.number().int(),
    isFollowing: z.boolean(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UsernameParamsSchema = z.object({
    username: z.string().min(1).max(50),
});
export type UsernameParams = z.infer<typeof UsernameParamsSchema>;

export const UserIdParamsSchema = z.object({
    userId: IdSchema,
});
export type UserIdParams = z.infer<typeof UserIdParamsSchema>;

export const FollowStatusSchema = z.object({
    isFollowing: z.boolean(),
    followersCount: z.number().int(),
});
export type FollowStatus = z.infer<typeof FollowStatusSchema>;

export const UpdateProfileRequestSchema = z
    .object({
        username: UsernameSchema.optional(),
        fullName: z.string().trim().max(100).nullable().optional(),
        bio: z.string().trim().max(1000).nullable().optional(),
    })
    .refine((body) => Object.values(body).some((value) => value !== undefined), 'Nothing to update');
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const ChangeEmailRequestSchema = z.object({
    email: z.email('Please enter a valid email').max(255),
    currentPassword: z.string().min(1, 'Current password is required').max(72),
});
export type ChangeEmailRequest = z.infer<typeof ChangeEmailRequestSchema>;
