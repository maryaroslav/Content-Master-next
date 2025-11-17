"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

function extractToken(session: Session | null): string | undefined {
    if (!session) return undefined;

    const s = session as unknown as {
        accessToken?: unknown;
        access_token?: unknown;
        user?: Record<string, unknown> | undefined;
    };

    if (typeof s.accessToken === "string") return s.accessToken;
    if (typeof s.access_token === "string") return s.access_token;

    if (s.user) {
        const user = s.user;
        const maybe = user as Record<string, unknown>;
        if (typeof maybe.accessToken === "string") return maybe.accessToken;
        if (typeof maybe.access_token === "string") return maybe.access_token;
    }

    return undefined;
}

const useSocket = (): RefObject<Socket | null> => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        let mounted = true;

        const connectSocket = async () => {
            const session = await getSession();
            const token = extractToken(session);
            if (!token) return;

            const socket: Socket = io("http://localhost:5000", {
                auth: {
                    token: `Bearer ${token}`,
                },
            });

            if (!mounted) {
                socket.disconnect();
                return;
            }

            socketRef.current = socket;
        };

        connectSocket();

        return () => {
            mounted = false;
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return socketRef;
};

export default useSocket;