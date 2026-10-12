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
}).meta({ id: 'UserSearchItem' });
export type UserSearchItem = z.infer<typeof UserSearchItemSchema>;

export const CommunitySearchItemSchema = CommunitySummarySchema.extend({
    isMember: z.boolean(),
}).meta({ id: 'CommunitySearchItem' });
export type CommunitySearchItem = z.infer<typeof CommunitySearchItemSchema>;

export const SearchResponseSchema = z.object({
    users: z.array(UserSearchItemSchema),
    communities: z.array(CommunitySearchItemSchema),
}).meta({ id: 'SearchResponse' });
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
