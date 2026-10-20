'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { User } from '@cm/api-client';
import { useRealtimeConnected } from '@cm/realtime';
import { useChatSender } from '@/chat/useChatSender';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

import userImg from '@images/icons/user.svg';

interface ChatWindowProps {
    peerId: number;
    peer: { username: string; profilePicture: string | null } | null;
    me: User;
}

export default function ChatWindow({ peerId, peer, me }: ChatWindowProps) {
    const t = useTranslations('chat');
    const connected = useRealtimeConnected();
    const sender = useChatSender(peerId);
    return (
        <>
            <div className="chat-header">
                <Image src={peer?.profilePicture ?? userImg} alt="" width={35} height={35} style={{ borderRadius: '50%' }} />
                <h3>{peer?.username ?? t('unknownUser', { id: peerId })}</h3>
                {!connected && <span className="chat-connection">{t('connecting')}</span>}
            </div>
            <MessageList
                peerId={peerId}
                myId={me.id}
                myAvatar={me.profilePicture}
                peerAvatar={peer?.profilePicture ?? null}
                sender={sender}
            />
            <MessageInput connected={connected} sender={sender} />
        </>
    );
}
