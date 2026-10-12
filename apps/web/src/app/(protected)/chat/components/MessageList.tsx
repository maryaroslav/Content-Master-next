'use client';

import { Fragment, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getChatMessagesInfiniteQueryKey, useChatMessagesInfinite } from '@cm/api-client';
import { useDateText } from '@/i18n/useDateText';
import { useErrorText } from '@/i18n/useErrorText';

import userImg from '@images/icons/user.svg';

interface MessageListProps {
    peerId: number;
    myId: number;
    myAvatar: string | null;
    peerAvatar: string | null;
}

export default function MessageList({ peerId, myId, myAvatar, peerAvatar }: MessageListProps) {
    const t = useTranslations();
    const errorText = useErrorText();
    const dates = useDateText();
    const containerRef = useRef<HTMLDivElement>(null);
    const { data, error, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessagesInfinite(peerId, undefined, {
        query: {
            queryKey: getChatMessagesInfiniteQueryKey(peerId),
            initialPageParam: undefined,
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        },
    });

    const messages = data ? [...data.pages].reverse().flatMap((page) => page.items) : [];
    const lastId = messages.at(-1)?.id;

    useEffect(() => {
        const container = containerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
    }, [lastId]);

    return (
        <div className="chat-messages" ref={containerRef}>
            {status === 'pending' && <p className="chat-status">{t('chat.loadingMessages')}</p>}
            {status === 'error' && <p className="chat-status">{errorText.request(error)}</p>}
            {hasNextPage && (
                <button type="button" className="chat-load-older" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>
                    {isFetchingNextPage ? t('common.loading') : t('chat.loadEarlier')}
                </button>
            )}
            {status === 'success' && messages.length === 0 && <p className="chat-status">{t('chat.empty')}</p>}
            {messages.map((message, index) => {
                const mine = message.fromUserId === myId;
                const previous = messages[index - 1];
                const newDay = !previous || dates.dayKey(previous.createdAt) !== dates.dayKey(message.createdAt);
                return (
                    <Fragment key={message.id}>
                        {newDay && (
                            <div className="chat-day">
                                <time dateTime={message.createdAt}>{dates.dayLabel(message.createdAt)}</time>
                            </div>
                        )}
                        <div className={`chat-message ${mine ? 'chat-message-self' : 'chat-message-other'}`}>
                            <div className="chat-message-author">
                                <Image
                                    src={(mine ? myAvatar : peerAvatar) ?? userImg}
                                    alt=""
                                    width={32}
                                    height={32}
                                    style={{ borderRadius: '50%', marginRight: 8 }}
                                />
                                <div className="message-container">
                                    {message.attachments.map((attachment) => (
                                        <Image
                                            key={attachment.id}
                                            src={attachment.url}
                                            alt={t('chat.attachedImage')}
                                            width={200}
                                            height={attachment.width && attachment.height ? Math.round(200 * attachment.height / attachment.width) : 200}
                                            style={{ borderRadius: 8 }}
                                        />
                                    ))}
                                    {message.content && <span>{message.content}</span>}
                                    <time className="chat-message-time" dateTime={message.createdAt}>{dates.time(message.createdAt)}</time>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );
}
