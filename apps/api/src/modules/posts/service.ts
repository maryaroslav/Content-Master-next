import { Op } from 'sequelize';
import type { CreatePostRequest } from '@cm/contracts';
import { Post, User } from '../../models';
import { AppError } from '../../lib/errors';
import { storage, UPLOAD_URL_PREFIX } from '../../storage/storage';
import { deleteFiles, saveImages } from '../../storage/images';

const withAuthor = { model: User, as: 'author', attributes: ['user_id', 'username', 'profile_picture'] };

// Without `limit` the whole feed is returned: the legacy API is not paginated.
export async function listPosts({ cursor, limit }: { cursor?: number; limit?: number } = {}) {
    const posts = await Post.findAll({
        where: cursor ? { post_id: { [Op.lt]: cursor } } : {},
        include: [withAuthor],
        // post_id grows with created_at and is the cursor, so it is also the sort key.
        order: [['post_id', 'DESC']],
        limit: limit ? limit + 1 : undefined,
    });

    if (!limit || posts.length <= limit) return { posts, nextCursor: null };
    const page = posts.slice(0, limit);
    return { posts: page, nextCursor: page[page.length - 1]!.post_id };
}

// posts.image_url still holds public paths; it becomes storage keys with the post_images migration.
const keyFromPath = (urlPath: string) => urlPath.replace(`${UPLOAD_URL_PREFIX}/`, '');

export async function createPost(authorId: number, { title, content }: CreatePostRequest, files: Express.Multer.File[]) {
    const keys = await saveImages(files, 'user_posts');
    try {
        const post = await Post.create({ title, content, image_url: keys.map(storage.url), author_id: authorId });
        return (await Post.findByPk(post.post_id, { include: [withAuthor] }))!;
    } catch (err) {
        await deleteFiles(keys);
        throw err;
    }
}

export async function deletePost(postId: number, userId: number): Promise<void> {
    const post = await Post.findByPk(postId);
    if (!post) throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    if (post.author_id !== userId) {
        throw new AppError(403, 'FORBIDDEN', 'You are not allowed to delete this post.');
    }
    await post.destroy();
    await deleteFiles(post.image_url.map(keyFromPath));
}
