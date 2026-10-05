import { z } from 'zod';
import { DateTimeSchema } from './common';

export const CommunityPrivacySchema = z.enum(['public', 'private']);
export type CommunityPrivacy = z.infer<typeof CommunityPrivacySchema>;

export const CommunitySchema = z.object({
    community_id: z.number().int(),
    name: z.string(),
    privacy: z.string(),
    description: z.string().nullable(),
    photo: z.string(),
    owner_id: z.number().int(),
    members_count: z.number().int(),
    theme: z.string(),
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
});
export type Community = z.infer<typeof CommunitySchema>;

export const CommunitySummarySchema = CommunitySchema.pick({
    community_id: true,
    name: true,
    privacy: true,
    photo: true,
    members_count: true,
});
export type CommunitySummary = z.infer<typeof CommunitySummarySchema>;

// Multipart text fields only: the photo arrives as a file.
export const CreateCommunityRequestSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(255),
    privacy: CommunityPrivacySchema,
    theme: z.string().trim().min(1, 'Theme is required').max(255),
    description: z.string().trim().max(2000).optional(),
});
export type CreateCommunityRequest = z.infer<typeof CreateCommunityRequestSchema>;

export const CreateCommunityResponseSchema = z.object({
    message: z.string(),
    community: CommunitySchema,
});
export type CreateCommunityResponse = z.infer<typeof CreateCommunityResponseSchema>;
