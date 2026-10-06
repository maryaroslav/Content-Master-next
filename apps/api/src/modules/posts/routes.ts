import type { Router } from 'express';
import { postEndpoints } from '@cm/contracts';
import { currentUserId } from '../../middlewares/requireAuth';
import { mount } from '../mount';
import { toPostDto } from './mapper';
import * as postsService from './service';

export function mountPostRoutes(router: Router): void {
    mount(router, postEndpoints.list, async ({ query }) => {
        const { posts, nextCursor } = await postsService.listPosts(query);
        return { items: posts.map(toPostDto), nextCursor };
    });

    mount(router, postEndpoints.create, async ({ body }, req) => {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        return toPostDto(await postsService.createPost(currentUserId(req), body, files));
    });

    mount(router, postEndpoints.delete, async ({ params }, req) => {
        await postsService.deletePost(params.postId, currentUserId(req));
    });
}
