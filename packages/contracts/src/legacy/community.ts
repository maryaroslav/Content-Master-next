import { z } from 'zod';
import { DateTimeSchema } from '../common';
import {
    CommunityPrivacySchema,
    CreateCommunityRequestSchema,
    type CommunityPrivacy,
    type CreateCommunityRequest,
} from '../community';

export { CommunityPrivacySchema, CreateCommunityRequestSchema, type CommunityPrivacy, type CreateCommunityRequest };

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


export const CreateCommunityResponseSchema = z.object({
    message: z.string(),
    community: CommunitySchema,
});
export type CreateCommunityResponse = z.infer<typeof CreateCommunityResponseSchema>;
