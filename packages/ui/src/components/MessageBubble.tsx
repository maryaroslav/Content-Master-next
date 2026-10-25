import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

export interface MessageBubbleLabels {
    sending: string;
    notSent: string;
    retry: string;
    discard: string;
}

export interface MessageBubbleProps {
    own?: boolean;
    text?: ReactNode;
    image?: { src: string; alt: string };
    /** The formatted time, rendered in <time dateTime>. */
    time?: string;
    dateTime?: string;
    avatar?: ReactNode;
    status?: 'sent' | 'pending' | 'failed';
    onRetry?: () => void;
    onDiscard?: () => void;
    labels: MessageBubbleLabels;
}

export function MessageBubble({ own, text, image, time, dateTime, avatar, status = 'sent', onRetry, onDiscard, labels }: MessageBubbleProps) {
    return (
        <Stack direction={own ? 'row-reverse' : 'row'} spacing={2} sx={{ alignItems: 'flex-end', alignSelf: own ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
            {avatar}
            <Stack spacing={1} sx={{ alignItems: own ? 'flex-end' : 'flex-start', minWidth: 0 }}>
                <Box
                    sx={(t) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        px: 3,
                        py: 2,
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                        borderRadius: t.radius.lg,
                        [own ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: t.radius.sm,
                        bgcolor: own ? 'cm.accentSoft' : 'cm.surfaceSunken',
                        color: 'text.primary',
                        ...(status === 'failed' ? { bgcolor: 'cm.dangerSoft', boxShadow: `inset 0 0 0 1px ${t.vars.palette.cm.danger}` } : null),
                    })}
                >
                    {image ? <Box component="img" src={image.src} alt={image.alt} sx={(t) => ({ display: 'block', maxWidth: 240, borderRadius: t.radius.md })} /> : null}
                    {text ? <span>{text}</span> : null}
                    <Box component="span" sx={{ alignSelf: 'flex-end', fontSize: 11, lineHeight: '14px', color: 'text.secondary' }}>
                        {status === 'pending' ? (
                            // Dimming the bubble would drop its text below 4.5:1; a spinner and the word carry the state.
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={10} thickness={6} color="inherit" aria-hidden />
                                {labels.sending}
                            </Box>
                        ) : time ? <time dateTime={dateTime}>{time}</time> : null}
                    </Box>
                </Box>
                {status === 'failed' ? (
                    <Stack direction="row" spacing={2} role="alert" sx={{ alignItems: 'center', fontSize: 12, color: 'cm.danger' }}>
                        <span>{labels.notSent}</span>
                        <Link component="button" type="button" onClick={onRetry} sx={{ fontSize: 12 }}>{labels.retry}</Link>
                        <Link component="button" type="button" onClick={onDiscard} sx={{ fontSize: 12 }}>{labels.discard}</Link>
                    </Stack>
                ) : null}
            </Stack>
        </Stack>
    );
}
