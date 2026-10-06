'use client';

import Image from 'next/image';
import { getErrorMessage, useUsersMyEvents } from '@cm/api-client';

import '@/styles/feedCommunity.css';
import arrowDown from '@images/icons/arrow-down.svg';

export default function EventList() {
    const { data: events, error, status, refetch } = useUsersMyEvents();

    return (
        <div className="feedcomunnity-grey">
            <div className="feedcommunity-container">
                {status === 'pending' && <p className="feedcommunity-status">Loading events...</p>}
                {status === 'error' && (
                    <div className="feedcommunity-status">
                        <p>{getErrorMessage(error)}</p>
                        <button type="button" onClick={() => void refetch()}>Try again</button>
                    </div>
                )}
                {status === 'success' && events.length === 0 && (
                    <p className="feedcommunity-status">You have not joined any events yet.</p>
                )}
                {events && events.length > 0 && (
                    <div className="feedcommunity-my-community-container">
                        <h2 className="feedcomunity-section-title">My events</h2>
                        {events.map((event) => (
                            <div key={event.id} className="feedcommunity-item">
                                <Image src={event.image} alt={event.title} width={100} height={100} />
                                <div className="feedcommunity-item-title">
                                    <p className="event-date">{new Date(event.createdAt).toLocaleDateString('cs-CZ')}</p>
                                    <p className="feedcommunity-name">{event.title}</p>
                                    <p className="feedcommunity-members">{event.membersCount ?? 0} people have joined this event</p>
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
