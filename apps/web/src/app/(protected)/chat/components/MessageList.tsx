'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { getChatMessagesInfiniteQueryKey, getErrorMessage, useChatMessagesInfinite } from '@cm/api-client';

import userImg from '@images/icons/user.svg';

interface MessageListProps {
    peerId: number;
    myId: number;
    myAvatar: string | null;
    peerAvatar: string | null;
}

export default function MessageList({ peerId, myId, myAvatar, peerAvatar }: MessageListProps) {
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
            {status === 'pending' && <p className="chat-status">Loading messages...</p>}
            {status === 'error' && <p className="chat-status">{getErrorMessage(error)}</p>}
            {hasNextPage && (
                <button type="button" className="chat-load-older" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>
                    {isFetchingNextPage ? 'Loading...' : 'Load earlier messages'}
                </button>
            )}
            {status === 'success' && messages.length === 0 && <p className="chat-status">No messages yet. Say hi!</p>}
            {messages.map((message) => {
                const mine = message.fromUserId === myId;
                return (
                    <div key={message.id} className={`chat-message ${mine ? 'chat-message-self' : 'chat-message-other'}`}>
                        <div className="chat-message-author">
                            <Image
                                src={(mine ? myAvatar : peerAvatar) ?? userImg}
                                alt=""
                                width={32}
                                height={32}
                                style={{ borderRadius: '50%', marginRight: 8 }}
                            />
                            <div className="message-container">
                                {message.type === 'image' && message.mediaUrl
                                    ? <Image src={message.mediaUrl} alt="Attached image" width={200} height={200} style={{ borderRadius: 8 }} />
                                    : <span>{message.content}</span>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
