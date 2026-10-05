import { z } from 'zod';
import { DateTimeSchema } from '../common';

export const EventSummarySchema = z.object({
    event_id: z.number().int(),
    title: z.string(),
    image: z.string(),
    created_at: DateTimeSchema,
    members_count: z.number().int().nullable(),
});
export type EventSummary = z.infer<typeof EventSummarySchema>;
