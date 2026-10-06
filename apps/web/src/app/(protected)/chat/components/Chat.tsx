'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
    getChatConversationsQueryKey,
    getChatMessagesInfiniteQueryKey,
    useChatConversations,
    type ChatMessage,
    type Conversation,
} from '@cm/api-client';
import { useAuth } from '@cm/auth';
import ChatWindow from './ChatWindow';
import ConversationList from './ConversationList';
import { appendMessage, touchConversation, type MessagesData } from './chatCache';
import { useChatSocket } from './useChatSocket';

export default function Chat({ initialPeerId }: { initialPeerId: number | null }) {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [peerId, setPeerId] = useState(initialPeerId);
    const [urlPeerId, setUrlPeerId] = useState(initialPeerId);
    const [unread, setUnread] = useState<ReadonlySet<number>>(new Set());

    if (initialPeerId !== urlPeerId) {
        setUrlPeerId(initialPeerId);
        setPeerId(initialPeerId);
    }
    const peerIdRef = useRef(peerId);
    const conversations = useChatConversations();

    useEffect(() => {
        peerIdRef.current = peerId;
    }, [peerId]);

    const { connected, send } = useChatSocket((message: ChatMessage) => {
        if (!user) return;
        const peer = message.fromUserId === user.id ? message.toUserId : message.fromUserId;
        queryClient.setQueryData<MessagesData>(getChatMessagesInfiniteQueryKey(peer), (data) => appendMessage(data, message));
        queryClient.setQueryData<Conversation[]>(getChatConversationsQueryKey(), (list) => touchConversation(list, peer, message.createdAt));
        if (peer !== peerIdRef.current && message.fromUserId !== user.id) {
            setUnread((current) => new Set(current).add(peer));
        }
    });

    const selectPeer = (id: number) => {
        setPeerId(id);
        setUnread((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
        });
        router.replace(`/chat?to=${id}`, { scroll: false });
    };

    const peer = conversations.data?.find((c) => c.user.id === peerId)?.user ?? null;

    return (
        <div className="chat-body">
            <ConversationList
                conversations={conversations.data}
                error={conversations.error}
                activeId={peerId}
                unread={unread}
                onSelect={selectPeer}
            />
            <div className="chat-main">
                {peerId === null || !user
                    ? <div className="chat-messages"><div className="chat-placeholder">Select a chat to start messaging</div></div>
                    : <ChatWindow key={peerId} peerId={peerId} peer={peer} me={user} connected={connected} send={send} />}
            </div>
        </div>
    );
}
