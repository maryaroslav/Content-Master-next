import type { Post as PostDto } from '@cm/contracts';
import type { Post } from '../../models';
import { publicUrl, storage } from '../../storage/storage';
import { imageKeys } from './service';

// Dates are still `Date` objects here; they become strings in the JSON response.
type SerializablePost = Omit<PostDto, 'createdAt' | 'updatedAt'> & { createdAt: Date; updatedAt: Date };

export function toPostDto(post: Post): SerializablePost {
    return {
        id: post.post_id,
        title: post.title ?? null,
        content: post.content ?? null,
        images: imageKeys(post).map(storage.url),
        authorId: post.author_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: {
            id: post.author!.user_id,
            username: post.author!.username,
            profilePicture: publicUrl(post.author!.profile_picture),
        },
    };
}
