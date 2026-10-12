import { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import type { RealtimeClient, ServerEventName, ServerEventPayload } from './client.js';

const RealtimeContext = createContext<RealtimeClient | null>(null);

interface RealtimeProviderProps {
    client: RealtimeClient;
    enabled: boolean;
    children: ReactNode;
}

export function RealtimeProvider({ client, enabled, children }: RealtimeProviderProps) {
    useEffect(() => {
        if (!enabled) return;
        client.connect();
        return () => client.disconnect();
    }, [client, enabled]);

    return <RealtimeContext value={client}>{children}</RealtimeContext>;
}

export function useRealtime(): RealtimeClient {
    const client = useContext(RealtimeContext);
    if (!client) throw new Error('useRealtime must be used inside RealtimeProvider');
    return client;
}

export function useRealtimeConnected(): boolean {
    const client = useRealtime();
    return useSyncExternalStore(client.subscribe, client.isConnected, () => false);
}

export function useRealtimeEvent<N extends ServerEventName>(name: N, handler: (payload: ServerEventPayload<N>) => void): void {
    const client = useRealtime();
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    });

    useEffect(() => client.on(name, (payload) => handlerRef.current(payload)), [client, name]);
}
