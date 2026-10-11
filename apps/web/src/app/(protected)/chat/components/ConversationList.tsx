import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Conversation } from '@cm/api-client';
import { useErrorText } from '@/i18n/useErrorText';

import userImg from '@images/icons/user.svg';

interface ConversationListProps {
    conversations: Conversation[] | undefined;
    error: unknown;
    activeId: number | null;
    unread: ReadonlySet<number>;
    onSelect: (userId: number) => void;
}

export default function ConversationList({ conversations, error, activeId, unread, onSelect }: ConversationListProps) {
    const t = useTranslations();
    const errorText = useErrorText();
    return (
        <div className="chat-sidebar">
            {error ? <p className="chat-status">{errorText.request(error)}</p> : null}
            {!conversations && !error && <p className="chat-status">{t('common.loading')}</p>}
            {conversations?.length === 0 && <p className="chat-status">{t('chat.noConversations')}</p>}
            <ul className="chat-user-list">
                {conversations?.map(({ user }) => (
                    <li key={user.id}>
                        <button
                            type="button"
                            className={`chat-user-item${user.id === activeId ? ' active' : ''}`}
                            onClick={() => onSelect(user.id)}
                        >
                            <Image src={user.profilePicture ?? userImg} alt="" width={32} height={32} />
                            {user.username}
                            {unread.has(user.id) && <span className="chat-unread" aria-label={t('chat.unread')} />}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
