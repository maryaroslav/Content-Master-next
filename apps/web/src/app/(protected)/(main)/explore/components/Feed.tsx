'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { usePostsDelete, usePostsListInfinite } from '@cm/api-client';
import { EmptyState } from '@cm/ui';
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

    const retry = (onRetry: () => void) => (
        <Button variant="soft" size="small" onClick={onRetry}>{t('common.tryAgain')}</Button>
    );

    return (
        <Stack spacing={4}>
            <AddPost />
            {status === 'pending' && (
                <Stack sx={{ alignItems: 'center', py: 8 }} role="status" aria-label={t('feed.loading')}>
                    <CircularProgress size={28} />
                </Stack>
            )}
            {status === 'error' && <Alert severity="error" action={retry(() => void refetch())}>{errorText.request(error)}</Alert>}
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
            {isFetchingNextPage && (
                <Stack sx={{ alignItems: 'center', py: 4 }} role="status" aria-label={t('feed.loadingMore')}>
                    <CircularProgress size={24} />
                </Stack>
            )}
            {isFetchNextPageError && <Alert severity="error" action={retry(() => void fetchNextPage())}>{t('feed.loadMoreFailed')}</Alert>}
        </Stack>
    );
}
