import http from 'http';
import type { AddressInfo } from 'net';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import { ChatMessageSchema, type ChatMessage, type ClientToServerEvents, type ServerToClientEvents } from '@cm/contracts';
import { app } from '../../src/app';
import initializeSocket from '../../src/sockets';
import { Message } from '../../src/models';
import { api, createUser, resetDatabase, testImage, type TestUser } from './helpers';

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

const server = http.createServer(app);
const io = initializeSocket(server);
let url: string;
const clients: Client[] = [];

beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, resolve));
    url = `http://localhost:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((resolve) => io.close(() => resolve())));
beforeEach(resetDatabase);
afterEach(() => clients.splice(0).forEach((client) => client.disconnect()));

function open(token: string): Promise<Client> {
    const client: Client = connect(url, { auth: { token }, transports: ['websocket'], forceNew: true, reconnection: false });
    clients.push(client);
    return new Promise((resolve, reject) => {
        client.once('connect', () => resolve(client));
        client.once('connect_error', reject);
    });
}

const as = (user: TestUser) => open(`Bearer ${user.accessToken}`);

const nextMessage = (client: Client) =>
    new Promise<ChatMessage>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('No message:new received')), 2000);
        client.once('message:new', (message) => {
            clearTimeout(timer);
            resolve(message);
        });
    });

const send = (client: Client, payload: unknown) =>
    client.timeout(2000).emitWithAck('message:send', payload as Parameters<ClientToServerEvents['message:send']>[0]);

describe('socket connection', () => {
    it('rejects a missing or invalid token', async () => {
        await expect(open('')).rejects.toThrow('No token provided');
        await expect(open('Bearer nope')).rejects.toThrow('Invalid token');
    });
});

describe('message:send', () => {
    it('acks the sender and delivers the message to the recipient and the sender’s other tabs', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        const [tab, otherTab, bobClient] = [await as(me), await as(me), await as(bob)];
        const received = Promise.all([nextMessage(bobClient), nextMessage(otherTab)]);

        const result = await send(tab, { toUserId: bob.id, text: 'hello' });

        expect(result.ok).toBe(true);
        const message = ChatMessageSchema.parse(result.ok && result.data);
        expect(message).toMatchObject({ fromUserId: me.id, toUserId: bob.id, content: 'hello', attachments: [] });
        expect(await received).toEqual([message, message]);
    });

    it('sends an uploaded image', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        const upload = await api().post('/api/v1/chat/attachments').set(me.auth).attach('image', await testImage(), 'x.png').expect(201);

        const result = await send(await as(me), { toUserId: bob.id, attachmentIds: [upload.body.id] });

        expect(ChatMessageSchema.parse(result.ok && result.data).attachments.map((a) => a.id)).toEqual([upload.body.id]);
    });

    it('answers an invalid payload with a validation error and keeps the connection', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        const client = await as(me);

        expect(await send(client, { toUserId: 'bob' })).toMatchObject({
            ok: false,
            error: { code: 'VALIDATION_ERROR', details: [expect.objectContaining({ path: 'toUserId' })] },
        });
        expect(await send(client, null)).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR' } });

        expect(client.connected).toBe(true);
        expect(await send(client, { toUserId: bob.id, text: 'still here' })).toMatchObject({ ok: true });
    });

    it('reports service errors to the sender', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        const client = await as(me);

        expect(await send(client, { toUserId: bob.id, attachmentIds: [12345] })).toMatchObject({ ok: false, error: { code: 'INVALID_ATTACHMENT' } });
        expect(await send(client, { toUserId: me.id, text: 'hi' })).toMatchObject({ ok: false, error: { code: 'CANNOT_MESSAGE_SELF' } });
        expect(await Message.count()).toBe(0);
    });
});
