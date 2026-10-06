import { z } from 'zod';

export const ErrorResponseSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
}).meta({ id: 'ErrorResponse' });
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const IdSchema = z.coerce.number().int().positive();

export const DateTimeSchema = z.iso.datetime();

export const PaginationQuerySchema = z.object({
    cursor: IdSchema.optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const paginated = <T extends z.ZodType>(item: T) =>
    z.object({
        items: z.array(item),
        nextCursor: z.number().int().nullable(),
    });
