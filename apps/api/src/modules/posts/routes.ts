import { Router } from 'express';
import { CreatePostRequestSchema, PaginationQuerySchema, PostIdParamsSchema } from '@cm/contracts';
import { imageUpload } from '../../middlewares/upload';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import { toPostDto } from './mapper';
import * as postsService from './service';

const router = Router();

router.use(requireAuth);

router.get('/', withValidation({ query: PaginationQuerySchema }, async ({ query }, _req, res) => {
    const { posts, nextCursor } = await postsService.listPosts(query);
    res.json({ items: posts.map(toPostDto), nextCursor });
}));

router.post('/', imageUpload.array('images', 5), withValidation({ body: CreatePostRequestSchema }, async ({ body }, req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const post = await postsService.createPost(currentUserId(req), body, files);
    res.status(201).json(toPostDto(post));
}));

router.delete('/:postId', withValidation({ params: PostIdParamsSchema }, async ({ params }, req, res) => {
    await postsService.deletePost(params.postId, currentUserId(req));
    res.status(204).end();
}));

export default router;
