import { z } from 'zod';
import { DateTimeSchema, IdSchema, paginated } from './common';

export const PostSchema = z.object({
    id: z.number().int(),
    title: z.string().nullable(),
    content: z.string().nullable(),
    images: z.array(z.string()),
    authorId: z.number().int(),
    createdAt: DateTimeSchema,
    updatedAt: DateTimeSchema,
    author: z.object({
        id: z.number().int(),
        username: z.string(),
        profilePicture: z.string().nullable(),
    }),
}).meta({ id: 'Post' });
export type Post = z.infer<typeof PostSchema>;

export const PostPageSchema = paginated(PostSchema).meta({ id: 'PostPage' });
export type PostPage = z.infer<typeof PostPageSchema>;

export const CreatePostRequestSchema = z.object({
    title: z.string().trim().max(100).optional(),
    content: z.string().trim().max(10_000).optional(),
});
export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;

export const PostIdParamsSchema = z.object({
    postId: IdSchema,
});
export type PostIdParams = z.infer<typeof PostIdParamsSchema>;
