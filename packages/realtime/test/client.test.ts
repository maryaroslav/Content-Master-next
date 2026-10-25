import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Server, type Socket } from 'socket.io';
import { createRealtimeClient, type RealtimeClient } from '../src/client.js';

const message = {
    id: 1,
    fromUserId: 2,
    toUserId: 3,
    content: 'hi',
    attachments: [],
    type: 'text',
    createdAt: '2026-10-12T10:00:00.000Z',
};

const httpServer = createServer();
const io = new Server(httpServer);
let url: string;
let sockets: Socket[] = [];
const clients: RealtimeClient[] = [];

io.use((socket, next) => (socket.handshake.auth.token === 'Bearer good' ? next() : next(new Error('Invalid token'))));
io.on('connection', (socket) => {
    sockets.push(socket);
    socket.on('message:send', (payload: { text?: string }, ack: (result: unknown) => void) => {
        if (payload.text !== 'no answer') ack({ ok: true, data: { ...message, content: payload.text } });
    });
});

beforeAll(async () => {
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    url = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((resolve) => io.close(() => resolve())));
afterEach(() => {
    clients.splice(0).forEach((client) => client.disconnect());
    sockets = [];
    vi.restoreAllMocks();
});

function client(getToken: () => Promise<string | null> = () => Promise.resolve('good')) {
    const created = createRealtimeClient({ url: () => url, getToken, ackTimeoutMs: 200 });
    clients.push(created);
    return created;
}

const until = (condition: () => boolean) =>
    vi.waitFor(() => {
        if (!condition()) throw new Error('Condition not met');
    }, { timeout: 2000, interval: 10 });

describe('createRealtimeClient', () => {
    it('connects with the token and notifies subscribers', async () => {
        const realtime = client();
        const listener = vi.fn();
        realtime.subscribe(listener);

        realtime.connect();
        await until(realtime.isConnected);

        expect(listener).toHaveBeenCalled();
        expect(sockets).toHaveLength(1);
    });

    it('resolves emits with the server ack, or with NOT_CONNECTED and TIMEOUT errors', async () => {
        const realtime = client();
        expect(await realtime.emit('message:send', { toUserId: 3, text: 'early' })).toMatchObject({ ok: false, error: { code: 'NOT_CONNECTED' } });

        realtime.connect();
        await until(realtime.isConnected);

        expect(await realtime.emit('message:send', { toUserId: 3, text: 'hello' })).toEqual({ ok: true, data: { ...message, content: 'hello' } });
        expect(await realtime.emit('message:send', { toUserId: 3, text: 'no answer' })).toMatchObject({ ok: false, error: { code: 'TIMEOUT' } });
    });

    it('delivers valid server events and drops invalid ones', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const realtime = client();
        const handler = vi.fn();
        const off = realtime.on('message:new', handler);
        realtime.connect();
        await until(realtime.isConnected);

        sockets[0]!.emit('message:new', { id: 'not a message' });
        sockets[0]!.emit('message:new', message);
        await until(() => handler.mock.calls.length === 1);

        expect(handler).toHaveBeenCalledWith(message);
        expect(warn).toHaveBeenCalledOnce();

        off();
        sockets[0]!.emit('message:new', message);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(handler).toHaveBeenCalledOnce();
    });

    it('reconnects with a new token when the server ends the connection', async () => {
        const getToken = vi.fn(() => Promise.resolve('good'));
        const realtime = client(getToken);
        realtime.connect();
        await until(realtime.isConnected);

        sockets[0]!.disconnect(true);
        await until(() => sockets.length === 2 && realtime.isConnected());

        expect(getToken).toHaveBeenCalledTimes(2);
    });

    it('retries a rejected handshake once, then stays disconnected', async () => {
        const getToken = vi.fn(() => Promise.resolve('bad'));
        const realtime = client(getToken);
        realtime.connect();

        await until(() => getToken.mock.calls.length === 2);
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(getToken).toHaveBeenCalledTimes(2);
        expect(realtime.isConnected()).toBe(false);
    });

    it('does not reconnect after disconnect()', async () => {
        const realtime = client();
        realtime.connect();
        await until(realtime.isConnected);

        realtime.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(realtime.isConnected()).toBe(false);
        expect(sockets).toHaveLength(1);
    });
});
