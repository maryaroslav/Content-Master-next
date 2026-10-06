'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ChatMessage } from '@cm/api-client';
import { getFreshAccessToken } from '@cm/auth';
import { publicEnv } from '@cm/env';

export type OutgoingMessage =
    | { toUserId: number; type: 'text'; message: string }
    | { toUserId: number; type: 'image'; media_url: string };

export function useChatSocket(onMessage: (message: ChatMessage) => void) {
    const socketRef = useRef<Socket | null>(null);
    const onMessageRef = useRef(onMessage);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => {
        const socket = io(publicEnv().REALTIME_URL, {
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
        socket.on('private_message', (message: ChatMessage) => onMessageRef.current(message));

        socketRef.current = socket;
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const send = useCallback((message: OutgoingMessage) => {
        socketRef.current?.emit('private_message', message);
    }, []);

    return { connected, send };
}
