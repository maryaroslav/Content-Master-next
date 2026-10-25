'use client';

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useUsersMyCommunities, useUsersMyEvents } from '@cm/api-client';
import { SectionCard } from '@cm/ui';
import { useCompactNumber } from '@/i18n/useCompactNumber';
import { useDateText } from '@/i18n/useDateText';

const COMMUNITIES_SHOWN = 4;
const EVENTS_SHOWN = 6;

export default function MainSidebar() {
    const t = useTranslations();
    const compact = useCompactNumber();
    const dates = useDateText();
    const { data: communities = [] } = useUsersMyCommunities();
    const { data: events = [] } = useUsersMyEvents();
    const [allCommunities, setAllCommunities] = useState(false);
    const [allEvents, setAllEvents] = useState(false);

    const toggle = (count: number, shown: number, all: boolean, setAll: (all: boolean) => void) => count > shown ? (
        <Button variant="text" size="small" onClick={() => setAll(!all)} aria-expanded={all} sx={{ ml: 1 }}>
            {t(all ? 'nav.showLess' : 'nav.showAll')}
        </Button>
    ) : null;

    return (
        <>
            <SectionCard title={t('nav.myCommunity')} href="/community" flush>
                <List aria-label={t('nav.myCommunity')}>
                    {(allCommunities ? communities : communities.slice(0, COMMUNITIES_SHOWN)).map((community) => (
                        <ListItem key={community.id} sx={{ gap: 3, px: 3 }}>
                            <ListItemAvatar>
                                <Avatar variant="rounded" src={community.photo} alt="" sx={{ width: 48, height: 48 }} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={community.name}
                                secondary={
                                    <>
                                        <Typography component="span" variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: '16px' }}>
                                            {t(community.privacy === 'private' ? 'common.privacy.private' : 'common.privacy.public')}
                                        </Typography>
                                        {t('common.members', { count: community.membersCount, formatted: compact(community.membersCount) })}
                                    </>
                                }
                                slotProps={{ secondary: { component: 'span' } }}
                            />
                        </ListItem>
                    ))}
                </List>
                {toggle(communities.length, COMMUNITIES_SHOWN, allCommunities, setAllCommunities)}
            </SectionCard>
            <SectionCard title={t('nav.events')} href="/events" flush>
                <List aria-label={t('nav.events')}>
                    {(allEvents ? events : events.slice(0, EVENTS_SHOWN)).map((event) => (
                        <ListItem key={event.id} sx={{ gap: 3, px: 3 }}>
                            <ListItemAvatar>
                                <Avatar variant="rounded" src={event.image} alt="" sx={{ width: 48, height: 48 }} />
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
                {toggle(events.length, EVENTS_SHOWN, allEvents, setAllEvents)}
            </SectionCard>
        </>
    );
}
