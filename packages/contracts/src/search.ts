import { z } from 'zod';
import { CommunitySummarySchema } from './community';

export const SearchQuerySchema = z.object({
    q: z.string().trim().max(100).default(''),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const UserSearchItemSchema = z.object({
    user_id: z.number().int(),
    username: z.string(),
    bio: z.string().nullable(),
    profile_picture: z.string().nullable(),
});
export type UserSearchItem = z.infer<typeof UserSearchItemSchema>;

export const SearchResponseSchema = z.object({
    users: z.array(UserSearchItemSchema),
    communities: z.array(CommunitySummarySchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
