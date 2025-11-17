import { Router, Request, Response } from 'express';
import authToken from '../middlewares/authToken';
import upload from '../middlewares/uploadPostImage';
import db from '../models';

const router = Router();
const { Post, User } = db as any;

router.post(
    '/',
    authToken,
    upload.array('images', 5),
    async (req: Request, res: Response) => {
        try {
            console.log('[posts.upload] req.file(s):', req.files);
            const { title, content } = req.body;
            const files = (req.files as Express.Multer.File[] | undefined) ?? [];

            const imagePaths = files.map((file) => `/uploads/user_posts/${file.filename}`);
            console.log('[posts.upload] saved imagePaths:', imagePaths);

            const authorId = (req as any).user?.user_id;
            if (!authorId) return res.status(401).json({ message: 'Unauthorized' });

            const newPost = await Post.create({
                title,
                content,
                image_url: imagePaths,
                author_id: authorId,
            });

            res.status(201).json(newPost);
        } catch (err: unknown) {
            console.error('[post error]', err);
            res.status(500).json({ message: 'Error creating a post', error: (err as Error)?.message ?? String(err) });
        }
    }
);

router.get('/', authToken, async (req: Request, res: Response) => {
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
        console.error('[get posts error]', err);
        res.status(500).json({ message: 'Error in getting posts', error: (err as Error)?.message ?? String(err) });
    }
});

router.delete('/:id', authToken, async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id, 10);
        if (Number.isNaN(postId)) return res.status(400).json({ message: 'Invalid post id' });

        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = (req as any).user?.user_id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        if (post.author_id !== userId) {
            return res.status(403).json({ message: 'You are not allowed to delete this post.' });
        }

        await post.destroy();
        res.status(200).json({ message: 'Post deleted' });
    } catch (err: unknown) {
        console.error('[delete post error]', err);
        res.status(500).json({ message: 'Error deleting post', error: (err as Error)?.message ?? String(err) });
    }
});

export default router;