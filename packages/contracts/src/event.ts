import { z } from 'zod';
import { DateTimeSchema } from './common';

export const EventSummarySchema = z.object({
    id: z.number().int(),
    title: z.string(),
    image: z.string(),
    createdAt: DateTimeSchema,
    membersCount: z.number().int().nullable(),
});
export type EventSummary = z.infer<typeof EventSummarySchema>;
