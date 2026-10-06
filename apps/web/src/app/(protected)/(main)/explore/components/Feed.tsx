'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, usePostsDelete, usePostsListInfinite } from '@cm/api-client';
import AddPost from './AddPost';
import FeedPost from './FeedPost';
import { feedQueryKey, removePost, type FeedData } from './feedCache';

import '@/styles/feed.css';

export default function Feed() {
    const {
        data,
        error,
        status,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetchNextPageError,
    } = usePostsListInfinite(undefined, {
        query: {
            queryKey: feedQueryKey,
            initialPageParam: undefined,
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        },
    });
    const sentinelRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const [deleteError, setDeleteError] = useState<{ postId: number; message: string } | null>(null);

    const { mutate: deletePost } = usePostsDelete({
        mutation: {
            onMutate: async ({ postId }) => {
                setDeleteError(null);
                await queryClient.cancelQueries({ queryKey: feedQueryKey });
                const previous = queryClient.getQueryData<FeedData>(feedQueryKey);
                queryClient.setQueryData<FeedData>(feedQueryKey, (current) => removePost(current, postId));
                return { previous };
            },
            onError: (err, { postId }, context) => {
                queryClient.setQueryData(feedQueryKey, context?.previous);
                setDeleteError({ postId, message: getErrorMessage(err) });
            },
        },
    });

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) void fetchNextPage();
            },
            { rootMargin: '400px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

    const posts = data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <div className="feed-container">
            <AddPost />
            <div className="feed-posts-container">
                {status === 'pending' && <p className="feed-status">Loading posts...</p>}
                {status === 'error' && (
                    <div className="feed-status">
                        <p>{getErrorMessage(error)}</p>
                        <button type="button" onClick={() => void refetch()}>Try again</button>
                    </div>
                )}
                {status === 'success' && posts.length === 0 && (
                    <p className="feed-status">No posts yet. Share the first one!</p>
                )}
                {posts.map((post) => (
                    <FeedPost
                        key={post.id}
                        post={post}
                        onDelete={() => deletePost({ postId: post.id })}
                        deleteError={deleteError?.postId === post.id ? deleteError.message : undefined}
                    />
                ))}
                <div ref={sentinelRef} />
                {isFetchingNextPage && <p className="feed-status">Loading more...</p>}
                {isFetchNextPageError && (
                    <div className="feed-status">
                        <p>Could not load more posts.</p>
                        <button type="button" onClick={() => void fetchNextPage()}>Try again</button>
                    </div>
                )}
            </div>
        </div>
    );
}
