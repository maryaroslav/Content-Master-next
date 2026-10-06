import type { InfiniteData } from '@tanstack/react-query';
import { getPostsListInfiniteQueryKey, type Post, type PostPage } from '@cm/api-client';

export type FeedData = InfiniteData<PostPage, number | undefined>;

export const feedQueryKey = getPostsListInfiniteQueryKey();

export function prependPost(data: FeedData | undefined, post: Post): FeedData | undefined {
    const [first, ...rest] = data?.pages ?? [];
    if (!data || !first) return data;
    return { ...data, pages: [{ ...first, items: [post, ...first.items] }, ...rest] };
}

export function removePost(data: FeedData | undefined, postId: number): FeedData | undefined {
    if (!data) return data;
    return {
        ...data,
        pages: data.pages.map((page) => ({ ...page, items: page.items.filter((post) => post.id !== postId) })),
    };
}
