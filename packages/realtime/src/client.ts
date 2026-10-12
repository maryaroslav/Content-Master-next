import { io, type Socket } from 'socket.io-client';
import { serverEvents, type ClientToServerEvents, type ServerToClientEvents } from '@cm/contracts';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type ClientEventName = keyof ClientToServerEvents;
export type ServerEventName = keyof ServerToClientEvents;
export type EventPayload<N extends ClientEventName> = Parameters<ClientToServerEvents[N]>[0];
export type EventAck<N extends ClientEventName> = Parameters<Parameters<ClientToServerEvents[N]>[1]>[0];
export type ServerEventPayload<N extends ServerEventName> = Parameters<ServerToClientEvents[N]>[0];

export interface RealtimeOptions {
    url: () => string;
    getToken: () => Promise<string | null>;
    ackTimeoutMs?: number;
}

export interface RealtimeClient {
    connect(): void;
    disconnect(): void;
    isConnected(): boolean;
    subscribe(listener: () => void): () => void;
    emit<N extends ClientEventName>(name: N, payload: EventPayload<N>): Promise<EventAck<N>>;
    on<N extends ServerEventName>(name: N, handler: (payload: ServerEventPayload<N>) => void): () => void;
}

type LooseSocket = {
    on(name: string, listener: (payload: unknown) => void): void;
    off(name: string, listener: (payload: unknown) => void): void;
};

const schemas = new Map(Object.values(serverEvents).map((event) => [event.name as string, event.payload]));

export function createRealtimeClient({ url, getToken, ackTimeoutMs = 10_000 }: RealtimeOptions): RealtimeClient {
    let socket: AppSocket | null = null;
    let connected = false;
    let retriedAfterRejection = false;
    const listeners = new Set<() => void>();

    const setConnected = (value: boolean) => {
        if (connected === value) return;
        connected = value;
        listeners.forEach((listener) => listener());
    };

    const getSocket = (): AppSocket => {
        if (socket) return socket;
        const created: AppSocket = io(url(), {
            autoConnect: false,
            auth: (cb) => {
                void getToken().then(
                    (token) => cb({ token: token ? `Bearer ${token}` : '' }),
                    () => cb({ token: '' }),
                );
            },
        });
        created.on('connect', () => {
            retriedAfterRejection = false;
            setConnected(true);
        });
        created.on('disconnect', (reason) => {
            setConnected(false);
            if (reason === 'io server disconnect') created.connect();
        });
        created.on('connect_error', () => {
            if (!created.active && !retriedAfterRejection) {
                retriedAfterRejection = true;
                created.connect();
            }
        });
        socket = created;
        return created;
    };

    return {
        connect: () => {
            const current = getSocket();
            if (!current.active) current.connect();
        },
        disconnect: () => {
            socket?.disconnect();
            setConnected(false);
        },
        isConnected: () => connected,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        emit: async <N extends ClientEventName>(name: N, payload: EventPayload<N>): Promise<EventAck<N>> => {
            if (!socket?.connected) return { ok: false, error: { code: 'NOT_CONNECTED', message: 'Not connected' } } as EventAck<N>;
            const timed = socket.timeout(ackTimeoutMs);
            const emitWithAck = timed.emitWithAck.bind(timed) as (name: N, payload: EventPayload<N>) => Promise<EventAck<N>>;
            try {
                return await emitWithAck(name, payload);
            } catch {
                return { ok: false, error: { code: 'TIMEOUT', message: 'The server did not respond' } } as EventAck<N>;
            }
        },
        on: <N extends ServerEventName>(name: N, handler: (payload: ServerEventPayload<N>) => void) => {
            const schema = schemas.get(name)!;
            const listener = (payload: unknown) => {
                const result = schema.safeParse(payload);
                if (result.success) handler(result.data as ServerEventPayload<N>);
                else console.warn(`[realtime] Dropped an invalid "${name}" event`, result.error);
            };
            const target = getSocket() as unknown as LooseSocket;
            target.on(name, listener);
            return () => target.off(name, listener);
        },
    };
}
