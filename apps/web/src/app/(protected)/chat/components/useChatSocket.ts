'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Ack, ChatMessage, ClientToServerEvents, SendMessage, ServerToClientEvents } from '@cm/contracts';
import { getFreshAccessToken } from '@cm/auth';
import { publicEnv } from '@cm/env';

export type SendResult = Ack<ChatMessage>;

export function useChatSocket(onMessage: (message: ChatMessage) => void) {
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const onMessageRef = useRef(onMessage);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => {
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(publicEnv().REALTIME_URL, {
            auth: (cb) => {
                void getFreshAccessToken().then((token) => cb({ token: token ? `Bearer ${token}` : '' }));
            },
        });
        let retriedAfterRejection = false;

        socket.on('connect', () => {
            retriedAfterRejection = false;
            setConnected(true);
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', () => {
            if (!socket.active && !retriedAfterRejection) {
                retriedAfterRejection = true;
                socket.connect();
            }
        });
        socket.on('message:new', (message) => onMessageRef.current(message));

        socketRef.current = socket;
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const send = useCallback(async (message: SendMessage): Promise<SendResult> => {
        const socket = socketRef.current;
        if (!socket?.connected) return { ok: false, error: { code: 'NOT_CONNECTED', message: 'Not connected' } };
        try {
            const result = await socket.timeout(10_000).emitWithAck('message:send', message);
            if (result.ok) onMessageRef.current(result.data);
            return result;
        } catch {
            return { ok: false, error: { code: 'TIMEOUT', message: 'The server did not respond' } };
        }
    }, []);

    return { connected, send };
}
