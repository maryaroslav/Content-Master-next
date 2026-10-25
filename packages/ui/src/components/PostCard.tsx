import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { UserAvatar } from './UserAvatar';

export interface PostCardProps {
    /** `username` is shown as @username next to the time; leave it out when `name` already is the username. */
    author: { name: string; username?: string; avatar?: string | null; color?: string; href?: string };
    /** The formatted time, rendered in <time dateTime>. */
    time: string;
    dateTime: string;
    text?: ReactNode;
    images?: { src: string; alt: string }[];
    /** Actions for the author, e.g. a menu with Delete. */
    menu?: ReactNode;
}

export function PostCard({ author, time, dateTime, text, images = [], menu }: PostCardProps) {
    return (
        <Card component="article" sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                <UserAvatar name={author.name} src={author.avatar} color={author.color} decorative />
                <Stack sx={{ minWidth: 0, flex: 1 }}>
                    {author.href ? (
                        <Link href={author.href} color="inherit" sx={{ fontWeight: 500 }}>{author.name}</Link>
                    ) : (
                        <Typography variant="subtitle1">{author.name}</Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {author.username ? `@${author.username} · ` : null}
                        <time dateTime={dateTime}>{time}</time>
                    </Typography>
                </Stack>
                {menu}
            </Stack>
            {text ? <Typography variant="bodyLg" sx={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{text}</Typography> : null}
            {images.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                    {images.map((image) => (
                        <Box key={image.src} component="img" src={image.src} alt={image.alt} sx={(t) => ({ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: t.radius.md })} />
                    ))}
                </Box>
            ) : null}
        </Card>
    );
}
