import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface EntityListProps {
    /** Accessible name of the list. */
    label: string;
    children: ReactNode;
}

export function EntityList({ label, children }: EntityListProps) {
    return <List aria-label={label}>{children}</List>;
}

const imageSizes = { sm: 32, md: 48, lg: 56, xl: 64 } as const;

export interface EntityRowProps {
    title: ReactNode;
    /** Lines under the title (members, date, last message), each on its own line. */
    meta?: ReactNode | ReactNode[];
    /** Uppercase kicker above the title, e.g. the community privacy. */
    overline?: ReactNode;
    /** A square picture (community cover, event image); or pass `leading` for an avatar. */
    image?: string | null;
    imageSize?: keyof typeof imageSizes;
    leading?: ReactNode;
    /** A button or count at the end of the row. */
    action?: ReactNode;
    /** Makes the whole row a link or a button. */
    href?: string;
    onClick?: () => void;
    selected?: boolean;
    /** Bold title, for unread conversations. */
    unread?: boolean;
}

/** One row of a list: a person, a community, an event or a conversation. Use inside EntityList. */
export function EntityRow({ title, meta, overline, image, imageSize = 'md', leading, action, href, onClick, selected, unread }: EntityRowProps) {
    const lines = Array.isArray(meta) ? meta : meta ? [meta] : [];
    const content = (
        <>
            {leading ?? (image !== undefined ? (
                <ListItemAvatar>
                    <Avatar variant="rounded" src={image ?? undefined} alt="" sx={{ width: imageSizes[imageSize], height: imageSizes[imageSize] }} />
                </ListItemAvatar>
            ) : null)}
            <ListItemText
                primary={title}
                secondary={
                    overline || lines.length ? (
                        <>
                            {overline ? <Typography component="span" variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: '16px' }}>{overline}</Typography> : null}
                            {lines.map((line, i) => <Typography key={i} component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>{line}</Typography>)}
                        </>
                    ) : undefined
                }
                slotProps={{ primary: { sx: unread ? { fontWeight: 600 } : undefined }, secondary: { component: 'span' } }}
            />
            {action ? <Box sx={{ ml: 'auto', flex: 'none' }}>{action}</Box> : null}
        </>
    );
    if (href || onClick) {
        return (
            <ListItem disablePadding>
                {href ? (
                    <ListItemButton href={href} selected={selected} aria-current={selected ? 'page' : undefined}>{content}</ListItemButton>
                ) : (
                    <ListItemButton onClick={onClick} selected={selected} aria-pressed={selected}>{content}</ListItemButton>
                )}
            </ListItem>
        );
    }
    return <ListItem sx={{ gap: 3, px: 3 }}>{content}</ListItem>;
}
