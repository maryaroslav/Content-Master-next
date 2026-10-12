'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { User } from '@cm/api-client';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import type { SendMessage } from '@cm/contracts';
import type { SendResult } from './useChatSocket';

import userImg from '@images/icons/user.svg';

interface ChatWindowProps {
    peerId: number;
    peer: { username: string; profilePicture: string | null } | null;
    me: User;
    connected: boolean;
    send: (message: SendMessage) => Promise<SendResult>;
}

export default function ChatWindow({ peerId, peer, me, connected, send }: ChatWindowProps) {
    const t = useTranslations('chat');
    return (
        <>
            <div className="chat-header">
                <Image src={peer?.profilePicture ?? userImg} alt="" width={35} height={35} style={{ borderRadius: '50%' }} />
                <h3>{peer?.username ?? t('unknownUser', { id: peerId })}</h3>
                {!connected && <span className="chat-connection">{t('connecting')}</span>}
            </div>
            <MessageList peerId={peerId} myId={me.id} myAvatar={me.profilePicture} peerAvatar={peer?.profilePicture ?? null} />
            <MessageInput peerId={peerId} connected={connected} send={send} />
        </>
    );
}
