'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@cm/auth';
import { useRealtimeEvent } from '@cm/realtime';
import { addUnread, receiveMessage } from './chatCache';

export default function ChatRealtime() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useRealtimeEvent('message:new', (message) => {
        if (!user) return;
        const peer = receiveMessage(queryClient, message, user.id);
        if (message.fromUserId !== user.id) addUnread(queryClient, peer);
    });

    return null;
}
