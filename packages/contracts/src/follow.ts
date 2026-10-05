import { z } from 'zod';
import { IdSchema } from './common';

export const UserIdParamsSchema = z.object({
    userId: IdSchema,
});
export type UserIdParams = z.infer<typeof UserIdParamsSchema>;

export const FollowResponseSchema = z.object({
    success: z.boolean(),
    created: z.boolean(),
});
export type FollowResponse = z.infer<typeof FollowResponseSchema>;

export const UnfollowResponseSchema = z.object({
    success: z.boolean(),
    removed: z.boolean(),
});
export type UnfollowResponse = z.infer<typeof UnfollowResponseSchema>;

export const FollowStatusResponseSchema = z.object({
    isFollowing: z.boolean(),
});
export type FollowStatusResponse = z.infer<typeof FollowStatusResponseSchema>;
