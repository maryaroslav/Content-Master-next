import { Op } from 'sequelize';
import type { CreatePostRequest } from '@cm/contracts';
import { sequelize, Post, PostImage, User } from '../../models';
import { AppError } from '../../lib/errors';
import { deleteFiles, saveImages } from '../../storage/images';

const withAuthor = { model: User, as: 'author', attributes: ['user_id', 'username', 'profile_picture'] };
// A separate query keeps `limit` applying to posts, not to joined image rows.
const withImages = { model: PostImage, as: 'images', separate: true, order: [['position', 'ASC']] as [string, string][] };

export const imageKeys = (post: Post): string[] => (post.images ?? []).map((image) => image.image_key);

// Without `limit` the whole feed is returned: the legacy API is not paginated.
export async function listPosts({ cursor, limit }: { cursor?: number; limit?: number } = {}) {
    const posts = await Post.findAll({
        where: cursor ? { post_id: { [Op.lt]: cursor } } : {},
        include: [withAuthor, withImages],
        // post_id grows with created_at and is the cursor, so it is also the sort key.
        order: [['post_id', 'DESC']],
        limit: limit ? limit + 1 : undefined,
    });

    if (!limit || posts.length <= limit) return { posts, nextCursor: null };
    const page = posts.slice(0, limit);
    return { posts: page, nextCursor: page[page.length - 1]!.post_id };
}

export async function createPost(authorId: number, { title, content }: CreatePostRequest, files: Express.Multer.File[]) {
    const keys = await saveImages(files, 'user_posts');
    try {
        const postId = await sequelize.transaction(async (transaction) => {
            const post = await Post.create({ title, content, author_id: authorId }, { transaction });
            await PostImage.bulkCreate(
                keys.map((image_key, position) => ({ post_id: post.post_id, image_key, position })),
                { transaction }
            );
            return post.post_id;
        });
        return (await Post.findByPk(postId, { include: [withAuthor, withImages] }))!;
    } catch (err) {
        await deleteFiles(keys);
        throw err;
    }
}

export async function deletePost(postId: number, userId: number): Promise<void> {
    const post = await Post.findByPk(postId, { include: [withImages] });
    if (!post) throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    if (post.author_id !== userId) {
        throw new AppError(403, 'FORBIDDEN', 'You are not allowed to delete this post.');
    }
    await post.destroy();
    await deleteFiles(imageKeys(post));
}
