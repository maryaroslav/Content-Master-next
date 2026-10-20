'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useChatConversations } from '@cm/api-client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@cm/auth';
import { setActivePeer, useUnread } from '@/chat/chatCache';
import ChatWindow from './ChatWindow';
import ConversationList from './ConversationList';

export default function Chat({ initialPeerId }: { initialPeerId: number | null }) {
    const { user } = useAuth();
    const t = useTranslations('chat');
    const router = useRouter();
    const queryClient = useQueryClient();
    const [peerId, setPeerId] = useState(initialPeerId);
    const [urlPeerId, setUrlPeerId] = useState(initialPeerId);
    const conversations = useChatConversations();
    const unread = useUnread();

    if (initialPeerId !== urlPeerId) {
        setUrlPeerId(initialPeerId);
        setPeerId(initialPeerId);
    }

    useEffect(() => {
        setActivePeer(queryClient, peerId);
        return () => setActivePeer(queryClient, null);
    }, [queryClient, peerId]);

    const selectPeer = (id: number) => {
        setPeerId(id);
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
                    ? <div className="chat-messages"><div className="chat-placeholder">{t('select')}</div></div>
                    : <ChatWindow key={peerId} peerId={peerId} peer={peer} me={user} />}
            </div>
        </div>
    );
}
