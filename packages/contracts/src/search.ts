import { z } from 'zod';
import { CommunitySummarySchema } from './community';

export const SearchQuerySchema = z.object({
    q: z.string().trim().min(2, 'Enter at least 2 characters').max(100),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const UserSearchItemSchema = z.object({
    id: z.number().int(),
    username: z.string(),
    bio: z.string().nullable(),
    profilePicture: z.string().nullable(),
});
export type UserSearchItem = z.infer<typeof UserSearchItemSchema>;

export const SearchResponseSchema = z.object({
    users: z.array(UserSearchItemSchema),
    communities: z.array(CommunitySummarySchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
