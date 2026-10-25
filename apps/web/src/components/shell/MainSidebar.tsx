'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUsersMyCommunities, useUsersMyEvents } from '@cm/api-client';
import { Button, EntityList, EntityRow, SectionCard } from '@cm/ui';
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
        <Button variant="ghost" size="small" onClick={() => setAll(!all)} aria-expanded={all}>
            {t(all ? 'nav.showLess' : 'nav.showAll')}
        </Button>
    ) : null;

    return (
        <>
            <SectionCard title={t('nav.myCommunity')} href="/community" flush>
                <EntityList label={t('nav.myCommunity')}>
                    {(allCommunities ? communities : communities.slice(0, COMMUNITIES_SHOWN)).map((community) => (
                        <EntityRow
                            key={community.id}
                            image={community.photo}
                            overline={t(community.privacy === 'private' ? 'common.privacy.private' : 'common.privacy.public')}
                            title={community.name}
                            meta={t('common.members', { count: community.membersCount, formatted: compact(community.membersCount) })}
                        />
                    ))}
                </EntityList>
                {toggle(communities.length, COMMUNITIES_SHOWN, allCommunities, setAllCommunities)}
            </SectionCard>
            <SectionCard title={t('nav.events')} href="/events" flush>
                <EntityList label={t('nav.events')}>
                    {(allEvents ? events : events.slice(0, EVENTS_SHOWN)).map((event) => (
                        <EntityRow
                            key={event.id}
                            image={event.image}
                            title={event.title}
                            meta={[
                                <time key="date" dateTime={event.createdAt}>{dates.date(event.createdAt)}</time>,
                                t('events.joined', { count: event.membersCount ?? 0, formatted: compact(event.membersCount ?? 0) }),
                            ]}
                        />
                    ))}
                </EntityList>
                {toggle(events.length, EVENTS_SHOWN, allEvents, setAllEvents)}
            </SectionCard>
        </>
    );
}
