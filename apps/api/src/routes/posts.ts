import { Router } from 'express';
import { CreatePostRequestSchema, PostIdParamsSchema } from '@cm/contracts/legacy';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import upload from '../middlewares/uploadPostImage';
import { withValidation } from '../middlewares/validate';
import * as postsService from '../modules/posts/service';

const router = Router();

router.post('/', requireAuth, upload.array('images', 5), withValidation({ body: CreatePostRequestSchema }, async ({ body }, req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    res.status(201).json(await postsService.createPost(currentUserId(req), body, files));
}));

router.get('/', requireAuth, async (_req, res) => {
    const { posts } = await postsService.listPosts();
    res.json(posts);
});

router.delete('/:id', requireAuth, withValidation({ params: PostIdParamsSchema }, async ({ params }, req, res) => {
    await postsService.deletePost(params.id, currentUserId(req));
    res.json({ message: 'Post deleted' });
}));

export default router;
