import Image from 'next/image';
import { getErrorMessage, type Conversation } from '@cm/api-client';

import userImg from '@images/icons/user.svg';

interface ConversationListProps {
    conversations: Conversation[] | undefined;
    error: unknown;
    activeId: number | null;
    unread: ReadonlySet<number>;
    onSelect: (userId: number) => void;
}

export default function ConversationList({ conversations, error, activeId, unread, onSelect }: ConversationListProps) {
    return (
        <div className="chat-sidebar">
            {error ? <p className="chat-status">{getErrorMessage(error)}</p> : null}
            {!conversations && !error && <p className="chat-status">Loading...</p>}
            {conversations?.length === 0 && <p className="chat-status">Follow someone to start a chat.</p>}
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
                            {unread.has(user.id) && <span className="chat-unread" aria-label="Unread messages" />}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
