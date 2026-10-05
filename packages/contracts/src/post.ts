import { z } from 'zod';
import { DateTimeSchema, IdSchema } from './common';

export const PostSchema = z.object({
    post_id: z.number().int(),
    title: z.string().nullable(),
    content: z.string().nullable(),
    image_url: z.array(z.string()),
    author_id: z.number().int(),
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
    author: z
        .object({
            username: z.string(),
            profile_picture: z.string().nullable(),
        })
        .optional(),
});
export type Post = z.infer<typeof PostSchema>;

// Multipart text fields only: the images arrive as files.
export const CreatePostRequestSchema = z.object({
    title: z.string().trim().max(100).optional(),
    content: z.string().trim().max(10_000).optional(),
});
export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;

export const PostIdParamsSchema = z.object({
    id: IdSchema,
});
export type PostIdParams = z.infer<typeof PostIdParamsSchema>;
