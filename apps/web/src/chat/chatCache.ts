import { useQuery, type InfiniteData, type QueryClient, type QueryKey } from '@tanstack/react-query';
import {
    getChatConversationsQueryKey,
    getChatMessagesInfiniteQueryKey,
    type ChatMessage,
    type ChatMessagePage,
    type Conversation,
} from '@cm/api-client';
import type { ErrorResponse } from '@cm/contracts';

type MessagesData = InfiniteData<ChatMessagePage, number | undefined>;

export interface PendingMessage {
    clientId: string;
    toUserId: number;
    text: string;
    createdAt: string;
    status: 'sending' | 'failed';
    error?: ErrorResponse;
}

const unreadKey = ['chat', 'unread'] as const;
const activePeerKey = ['chat', 'activePeer'] as const;
export const pendingKey = (peerId: number) => ['chat', 'pending', peerId] as const;

function appendMessage(data: MessagesData | undefined, message: ChatMessage): MessagesData | undefined {
    const [newest, ...older] = data?.pages ?? [];
    if (!data || !newest || newest.items.some((m) => m.id === message.id)) return data;
    return { ...data, pages: [{ ...newest, items: [...newest.items, message] }, ...older] };
}

function touchConversation(list: Conversation[] | undefined, peerId: number, at: string): Conversation[] | undefined {
    if (!list?.some((c) => c.user.id === peerId)) return list;
    return list
        .map((c) => (c.user.id === peerId ? { ...c, lastMessageAt: at } : c))
        .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
}

export function receiveMessage(queryClient: QueryClient, message: ChatMessage, myId: number): number {
    const peer = message.fromUserId === myId ? message.toUserId : message.fromUserId;
    queryClient.setQueryData<MessagesData>(getChatMessagesInfiniteQueryKey(peer), (data) => appendMessage(data, message));
    queryClient.setQueryData<Conversation[]>(getChatConversationsQueryKey(), (list) => touchConversation(list, peer, message.createdAt));
    return peer;
}

export function useLocalQuery<T extends object>(queryKey: QueryKey, initial: T): T {
    return useQuery({
        queryKey,
        queryFn: ({ client }) => client.getQueryData<T>(queryKey) ?? initial,
        initialData: initial,
        staleTime: Infinity,
        gcTime: Infinity,
    }).data;
}

const noPeers: number[] = [];

export const useUnread = () => useLocalQuery(unreadKey, noPeers);

export function addUnread(queryClient: QueryClient, peerId: number): void {
    if (queryClient.getQueryData(activePeerKey) === peerId) return;
    queryClient.setQueryData<number[]>(unreadKey, (peers = []) => (peers.includes(peerId) ? peers : [...peers, peerId]));
}

export function setActivePeer(queryClient: QueryClient, peerId: number | null): void {
    queryClient.setQueryData(activePeerKey, peerId);
    if (peerId !== null) queryClient.setQueryData<number[]>(unreadKey, (peers = []) => peers.filter((id) => id !== peerId));
}
