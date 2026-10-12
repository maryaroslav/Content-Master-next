'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@cm/auth';
import { useRealtime } from '@cm/realtime';
import { pendingKey, receiveMessage, useLocalQuery, type PendingMessage } from './chatCache';

const noMessages: PendingMessage[] = [];

export function useChatSender(peerId: number) {
    const realtime = useRealtime();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const pending = useLocalQuery(pendingKey(peerId), noMessages);

    const update = (change: (list: PendingMessage[]) => PendingMessage[]) =>
        queryClient.setQueryData<PendingMessage[]>(pendingKey(peerId), (list = []) => change(list));

    const send = async (payload: { text: string } | { attachmentIds: number[] }) => {
        const result = await realtime.emit('message:send', { toUserId: peerId, ...payload });
        if (result.ok && user) receiveMessage(queryClient, result.data, user.id);
        return result;
    };

    const deliver = async (message: PendingMessage) => {
        const result = await send({ text: message.text });
        update((list) => result.ok
            ? list.filter((m) => m.clientId !== message.clientId)
            : list.map((m) => (m.clientId === message.clientId ? { ...m, status: 'failed', error: result.error } : m)));
    };

    return {
        pending,
        sendText: (text: string) => {
            const message: PendingMessage = {
                clientId: crypto.randomUUID(),
                toUserId: peerId,
                text,
                createdAt: new Date().toISOString(),
                status: 'sending',
            };
            update((list) => [...list, message]);
            void deliver(message);
        },
        sendAttachment: (attachmentId: number) => send({ attachmentIds: [attachmentId] }),
        retry: (clientId: string) => {
            const message = pending.find((m) => m.clientId === clientId);
            if (!message) return;
            update((list) => list.map((m) => (m.clientId === clientId ? { ...m, status: 'sending', error: undefined } : m)));
            void deliver(message);
        },
        dismiss: (clientId: string) => update((list) => list.filter((m) => m.clientId !== clientId)),
    };
}

export type ChatSender = ReturnType<typeof useChatSender>;
