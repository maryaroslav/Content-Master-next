import { z } from 'zod';

export const ErrorResponseSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// URL segments are always strings in Express.
export const IdSchema = z.coerce.number().int().positive();

// Dates arrive as ISO strings after JSON serialization.
export const DateTimeSchema = z.iso.datetime();
