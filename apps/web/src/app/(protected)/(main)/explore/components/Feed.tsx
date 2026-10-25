'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { usePostsDelete, usePostsListInfinite } from '@cm/api-client';
import { Card, EmptyState, ErrorState, LoadingState, Stack } from '@cm/ui';
import { useErrorText } from '@/i18n/useErrorText';
import AddPost from './AddPost';
import FeedPost from './FeedPost';
import { feedQueryKey, removePost, type FeedData } from './feedCache';

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
    const t = useTranslations();
    const errorText = useErrorText();
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
                setDeleteError({ postId, message: errorText.request(err) ?? '' });
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
        <Stack gap={4}>
            <AddPost />
            {status === 'pending' && <LoadingState label={t('feed.loading')} />}
            {status === 'error' && <ErrorState message={errorText.request(error)} retryLabel={t('common.tryAgain')} onRetry={() => void refetch()} />}
            {status === 'success' && posts.length === 0 && (
                <Card>
                    <EmptyState title={t('feed.empty')}>{t('feed.emptyText')}</EmptyState>
                </Card>
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
            {isFetchingNextPage && <LoadingState label={t('feed.loadingMore')} size="inline" />}
            {isFetchNextPageError && <ErrorState message={t('feed.loadMoreFailed')} retryLabel={t('common.tryAgain')} onRetry={() => void fetchNextPage()} />}
        </Stack>
    );
}
