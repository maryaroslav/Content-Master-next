import { z } from 'zod';
import { DateTimeSchema, IdSchema } from '../common';
import { CreatePostRequestSchema, type CreatePostRequest } from '../post';

export { CreatePostRequestSchema, type CreatePostRequest };

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

export const PostIdParamsSchema = z.object({
    id: IdSchema,
});
export type PostIdParams = z.infer<typeof PostIdParamsSchema>;
