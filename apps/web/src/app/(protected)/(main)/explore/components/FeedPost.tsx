'use client';

import { useId, useState } from 'react';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import type { Post } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import { PostCard } from '@cm/ui';
import { useDateText } from '@/i18n/useDateText';

interface FeedPostProps {
    post: Post;
    onDelete: () => void;
    deleteError?: string;
}

function PostMenu({ onDelete }: { onDelete: () => void }) {
    const t = useTranslations('feed');
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [confirming, setConfirming] = useState(false);
    const id = useId();
    return (
        <>
            <IconButton size="small" aria-label={t('options')} aria-haspopup="menu" aria-expanded={Boolean(anchor)} onClick={(e) => setAnchor(e.currentTarget)}>
                <MoreHorizRounded fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem sx={{ color: 'cm.danger' }} onClick={() => { setAnchor(null); setConfirming(true); }}>{t('delete')}</MenuItem>
            </Menu>
            <Dialog open={confirming} onClose={() => setConfirming(false)} aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`}>
                <DialogTitle id={`${id}-title`}>{t('deleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id={`${id}-text`}>{t('deleteText')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="soft" onClick={() => setConfirming(false)}>{t('cancel')}</Button>
                    <Button color="error" onClick={() => { setConfirming(false); onDelete(); }}>{t('delete')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default function FeedPost({ post, onDelete, deleteError }: FeedPostProps) {
    const { user } = useAuth();
    const t = useTranslations('feed');
    const dates = useDateText();
    return (
        <Stack spacing={2}>
            <PostCard
                author={{ name: post.author.username, avatar: post.author.profilePicture, href: `/profile/${post.author.username}` }}
                time={dates.relative(post.createdAt)}
                dateTime={post.createdAt}
                text={post.content}
                images={post.images.map((src, i) => ({ src, alt: `${t('image')} ${i + 1}` }))}
                menu={user?.id === post.authorId ? <PostMenu onDelete={onDelete} /> : undefined}
            />
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
        </Stack>
    );
}
