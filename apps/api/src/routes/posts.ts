import { Router, Request, Response } from 'express';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import upload from '../middlewares/uploadPostImage';
import { Post, User } from '../models';
import { CreatePostRequestSchema, PostIdParamsSchema } from '@cm/contracts';
import { logger } from '../lib/logger';
import { withValidation } from '../middlewares/validate';

const router = Router();

router.post(
    '/',
    requireAuth,
    upload.array('images', 5),
    withValidation({ body: CreatePostRequestSchema }, async ({ body }, req, res) => {
        try {
            const { title, content } = body;
            const files = (req.files as Express.Multer.File[] | undefined) ?? [];

            const imagePaths = files.map((file) => `/uploads/user_posts/${file.filename}`);

            const authorId = currentUserId(req);

            const newPost = await Post.create({
                title,
                content,
                image_url: imagePaths,
                author_id: authorId,
            });

            res.status(201).json(newPost);
        } catch (err: unknown) {
            logger.error({ err }, '[post error]');
            res.status(500).json({ message: 'Error creating a post', error: (err as Error)?.message ?? String(err) });
        }
    })
);

router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['username', 'profile_picture'],
                },
            ],
            order: [['created_at', 'DESC']],
        });
        res.json(posts);
    } catch (err: unknown) {
        logger.error({ err }, '[get posts error]');
        res.status(500).json({ message: 'Error in getting posts', error: (err as Error)?.message ?? String(err) });
    }
});

router.delete('/:id', requireAuth, withValidation({ params: PostIdParamsSchema }, async ({ params }, req, res) => {
    try {
        const postId = params.id;

        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = currentUserId(req);

        if (post.author_id !== userId) {
            return res.status(403).json({ message: 'You are not allowed to delete this post.' });
        }

        await post.destroy();
        res.status(200).json({ message: 'Post deleted' });
    } catch (err: unknown) {
        logger.error({ err }, '[delete post error]');
        res.status(500).json({ message: 'Error deleting post', error: (err as Error)?.message ?? String(err) });
    }
}));

export default router;