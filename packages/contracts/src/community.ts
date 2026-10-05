import { z } from 'zod';

export const CommunityPrivacySchema = z.enum(['public', 'private']);
export type CommunityPrivacy = z.infer<typeof CommunityPrivacySchema>;

export const CommunitySummarySchema = z.object({
    id: z.number().int(),
    name: z.string(),
    privacy: z.string(),
    photo: z.string(),
    membersCount: z.number().int(),
});
export type CommunitySummary = z.infer<typeof CommunitySummarySchema>;
