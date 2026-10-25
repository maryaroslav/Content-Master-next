'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Post } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import { ActionMenu, Alert, ConfirmDialog, PostCard, Stack } from '@cm/ui';
import { useDateText } from '@/i18n/useDateText';

interface FeedPostProps {
    post: Post;
    onDelete: () => void;
    deleteError?: string;
}

export default function FeedPost({ post, onDelete, deleteError }: FeedPostProps) {
    const { user } = useAuth();
    const t = useTranslations('feed');
    const dates = useDateText();
    const [confirming, setConfirming] = useState(false);
    const own = user?.id === post.authorId;
    return (
        <Stack gap={2}>
            <PostCard
                author={{ name: post.author.username, avatar: post.author.profilePicture, href: `/profile/${post.author.username}` }}
                time={dates.relative(post.createdAt)}
                dateTime={post.createdAt}
                text={post.content}
                images={post.images.map((src, i) => ({ src, alt: `${t('image')} ${i + 1}` }))}
                menu={own ? <ActionMenu label={t('options')} items={[{ label: t('delete'), danger: true, onSelect: () => setConfirming(true) }]} /> : undefined}
            />
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            {own && (
                <ConfirmDialog
                    open={confirming}
                    danger
                    title={t('deleteTitle')}
                    text={t('deleteText')}
                    confirmLabel={t('delete')}
                    cancelLabel={t('cancel')}
                    onConfirm={() => { setConfirming(false); onDelete(); }}
                    onClose={() => setConfirming(false)}
                />
            )}
        </Stack>
    );
}
