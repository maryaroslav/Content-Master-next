import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { getChatConversationsQueryKey, getChatMessagesInfiniteQueryKey, type Conversation } from '@cm/api-client';
import { addUnread, receiveMessage, setActivePeer } from '@/chat/chatCache';
import { message } from './fixtures';

const conversation = (id: number, lastMessageAt: string | null): Conversation => ({
    user: { id, username: `user${id}`, profilePicture: null },
    lastMessageAt,
});

function setup() {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getChatMessagesInfiniteQueryKey(2), {
        pages: [{ items: [message(10, 2, 1, 'older')], nextCursor: null }],
        pageParams: [undefined],
    });
    queryClient.setQueryData(getChatConversationsQueryKey(), [
        conversation(3, '2026-10-12T09:00:00.000Z'),
        conversation(2, '2026-10-11T09:00:00.000Z'),
    ]);
    return queryClient;
}

const history = (queryClient: QueryClient, peer: number) =>
    queryClient.getQueryData<{ pages: { items: { id: number }[] }[] }>(getChatMessagesInfiniteQueryKey(peer))?.pages[0]?.items.map((m) => m.id);

describe('receiveMessage', () => {
    it('appends to the peer history once and moves the conversation to the top', () => {
        const queryClient = setup();
        const incoming = message(11, 2, 1, 'hi', '2026-10-12T10:00:00.000Z');

        expect(receiveMessage(queryClient, incoming, 1)).toBe(2);
        receiveMessage(queryClient, incoming, 1);

        expect(history(queryClient, 2)).toEqual([10, 11]);
        expect(queryClient.getQueryData<Conversation[]>(getChatConversationsQueryKey())?.map((c) => c.user.id)).toEqual([2, 3]);
    });

    it('files my own message under the recipient', () => {
        const queryClient = setup();
        expect(receiveMessage(queryClient, message(12, 1, 2, 'mine'), 1)).toBe(2);
        expect(history(queryClient, 2)).toEqual([10, 12]);
    });
});

describe('unread peers', () => {
    const unread = (queryClient: QueryClient) => queryClient.getQueryData<number[]>(['chat', 'unread']);

    it('marks a peer once and clears it when the conversation is opened', () => {
        const queryClient = new QueryClient();
        addUnread(queryClient, 2);
        addUnread(queryClient, 2);
        expect(unread(queryClient)).toEqual([2]);

        setActivePeer(queryClient, 2);
        expect(unread(queryClient)).toEqual([]);
    });

    it('does not mark the conversation that is open', () => {
        const queryClient = new QueryClient();
        setActivePeer(queryClient, 2);
        addUnread(queryClient, 2);
        expect(unread(queryClient)).toEqual([]);
    });
});
