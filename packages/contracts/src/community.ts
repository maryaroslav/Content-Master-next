import { z } from 'zod';
import { DateTimeSchema, IdSchema } from './common';

export const CommunityPrivacySchema = z.enum(['public', 'private']);
export type CommunityPrivacy = z.infer<typeof CommunityPrivacySchema>;

export const CommunitySchema = z.object({
    id: z.number().int(),
    name: z.string(),
    privacy: z.string(),
    description: z.string().nullable(),
    photo: z.string(),
    ownerId: z.number().int(),
    membersCount: z.number().int(),
    theme: z.string(),
    createdAt: DateTimeSchema,
    updatedAt: DateTimeSchema,
});
export type Community = z.infer<typeof CommunitySchema>;

export const CommunitySummarySchema = z.object({
    id: z.number().int(),
    name: z.string(),
    privacy: z.string(),
    photo: z.string(),
    membersCount: z.number().int(),
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

export const CommunityListQuerySchema = z.object({
    owner: z.literal('me'),
});
export type CommunityListQuery = z.infer<typeof CommunityListQuerySchema>;

export const CommunityIdParamsSchema = z.object({
    communityId: IdSchema,
});
export type CommunityIdParams = z.infer<typeof CommunityIdParamsSchema>;

export const MembershipStatusSchema = z.object({
    isMember: z.boolean(),
    membersCount: z.number().int(),
});
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;
