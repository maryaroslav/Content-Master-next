'use client';

import { useTranslations } from 'next-intl';
import { useUsersMyEvents } from '@cm/api-client';
import { EmptyState, EntityList, EntityRow, ErrorState, LoadingState, SectionCard } from '@cm/ui';
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
            {status === 'pending' && <LoadingState label={t('events.loading')} />}
            {status === 'error' && <ErrorState message={errorText.request(error)} retryLabel={t('common.tryAgain')} onRetry={() => void refetch()} />}
            {status === 'success' && events.length === 0 && <EmptyState title={t('events.empty')} />}
            {events && events.length > 0 && (
                <EntityList label={t('events.title')}>
                    {events.map((event) => (
                        <EntityRow
                            key={event.id}
                            image={event.image}
                            imageSize="xl"
                            title={event.title}
                            meta={[
                                <time key="date" dateTime={event.createdAt}>{dates.date(event.createdAt)}</time>,
                                t('events.joined', { count: event.membersCount ?? 0, formatted: compact(event.membersCount ?? 0) }),
                            ]}
                        />
                    ))}
                </EntityList>
            )}
        </SectionCard>
    );
}
