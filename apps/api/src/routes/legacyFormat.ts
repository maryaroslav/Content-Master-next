import type { Community, Event, Post } from '../models';
import { storage } from '../storage/storage';
import { imageKeys } from '../modules/posts/service';

// The pre-v1 frontend expects public paths here; profile_picture stays a key because it prepends "/uploads/" itself.
export function legacyPost(post: Post) {
    return {
        post_id: post.post_id,
        title: post.title ?? null,
        content: post.content ?? null,
        image_url: imageKeys(post).map(storage.url),
        author_id: post.author_id,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: post.author && {
            user_id: post.author.user_id,
            username: post.author.username,
            profile_picture: post.author.profile_picture ?? null,
        },
    };
}

export const legacyCommunity = (community: Community) => ({ ...community.toJSON(), photo: storage.url(community.photo) });

export const legacyEvent = (event: Event) => ({ ...event.toJSON(), image: storage.url(event.image) });
