'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useUsersMyEvents } from '@cm/api-client';
import { useCompactNumber } from '@/i18n/useCompactNumber';
import { useDateText } from '@/i18n/useDateText';
import { useErrorText } from '@/i18n/useErrorText';

import '@/styles/feedCommunity.css';
import arrowDown from '@images/icons/arrow-down.svg';

export default function EventList() {
    const { data: events, error, status, refetch } = useUsersMyEvents();
    const t = useTranslations();
    const errorText = useErrorText();
    const compact = useCompactNumber();
    const dates = useDateText();

    return (
        <div className="feedcomunnity-grey">
            <div className="feedcommunity-container">
                {status === 'pending' && <p className="feedcommunity-status">{t('events.loading')}</p>}
                {status === 'error' && (
                    <div className="feedcommunity-status">
                        <p>{errorText.request(error)}</p>
                        <button type="button" onClick={() => void refetch()}>{t('common.tryAgain')}</button>
                    </div>
                )}
                {status === 'success' && events.length === 0 && (
                    <p className="feedcommunity-status">{t('events.empty')}</p>
                )}
                {events && events.length > 0 && (
                    <div className="feedcommunity-my-community-container">
                        <h2 className="feedcomunity-section-title">{t('events.title')}</h2>
                        {events.map((event) => (
                            <div key={event.id} className="feedcommunity-item">
                                <Image src={event.image} alt={event.title} width={100} height={100} />
                                <div className="feedcommunity-item-title">
                                    <time className="event-date" dateTime={event.createdAt}>{dates.date(event.createdAt)}</time>
                                    <p className="feedcommunity-name">{event.title}</p>
                                    <p className="feedcommunity-members">{t('events.joined', { count: event.membersCount ?? 0, formatted: compact(event.membersCount ?? 0) })}</p>
                                </div>
                                <div className="feedcommunity-arrow">
                                    <Image src={arrowDown} alt="" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
