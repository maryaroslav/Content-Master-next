import type { InfiniteData } from '@tanstack/react-query';
import type { ChatMessage, ChatMessagePage, Conversation } from '@cm/api-client';

export type MessagesData = InfiniteData<ChatMessagePage, number | undefined>;

export function appendMessage(data: MessagesData | undefined, message: ChatMessage): MessagesData | undefined {
    const [newest, ...older] = data?.pages ?? [];
    if (!data || !newest || newest.items.some((m) => m.id === message.id)) return data;
    return { ...data, pages: [{ ...newest, items: [...newest.items, message] }, ...older] };
}

export function touchConversation(list: Conversation[] | undefined, peerId: number, at: string): Conversation[] | undefined {
    if (!list?.some((c) => c.user.id === peerId)) return list;
    return list
        .map((c) => (c.user.id === peerId ? { ...c, lastMessageAt: at } : c))
        .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
}
