'use client';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { useUsersMyEvents } from '@cm/api-client';
import { EmptyState, SectionCard } from '@cm/ui';
import { useCompactNumber } from '@/i18n/useCompactNumber';
import { useDateText } from '@/i18n/useDateText';
import { useErrorText } from '@/i18n/useErrorText';

export default function EventList() {
    const { data: events, error, status, refetch } = useUsersMyEvents();
    const t = useTranslations();
    const errorText = useErrorText();
    const compact = useCompactNumber();
    const dates = useDateText();

    return (
        <SectionCard title={t('events.title')} flush>
            {status === 'pending' && (
                <Stack sx={{ alignItems: 'center', py: 8 }} role="status" aria-label={t('events.loading')}>
                    <CircularProgress size={28} />
                </Stack>
            )}
            {status === 'error' && (
                <Alert severity="error" sx={{ m: 3 }} action={<Button variant="soft" size="small" onClick={() => void refetch()}>{t('common.tryAgain')}</Button>}>
                    {errorText.request(error)}
                </Alert>
            )}
            {status === 'success' && events.length === 0 && <EmptyState title={t('events.empty')} />}
            {events && events.length > 0 && (
                <List aria-label={t('events.title')}>
                    {events.map((event) => (
                        <ListItem key={event.id} sx={{ gap: 4, px: 3 }}>
                            <ListItemAvatar>
                                <Avatar variant="rounded" src={event.image} alt="" sx={{ width: 64, height: 64 }} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={event.title}
                                secondary={
                                    <>
                                        <time dateTime={event.createdAt} style={{ display: 'block' }}>{dates.date(event.createdAt)}</time>
                                        {t('events.joined', { count: event.membersCount ?? 0, formatted: compact(event.membersCount ?? 0) })}
                                    </>
                                }
                                slotProps={{ secondary: { component: 'span' } }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </SectionCard>
    );
}
