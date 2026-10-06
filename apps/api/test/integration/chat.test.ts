import { beforeEach, describe, expect, it } from 'vitest';
import { ChatMessagePageSchema, ConversationSchema, EventSummarySchema } from '@cm/contracts';
import { Event, Message, UserEvent } from '../../src/models';
import { api, createUser, resetDatabase, testImage, uploadedFileExists } from './helpers';

beforeEach(resetDatabase);

// Messages are sent over Socket.IO, so the tests write them straight to the database.
const message = (from: number, to: number, content: string, at: string) =>
    Message.create({ from_user_id: from, to_user_id: to, content, type: 'text', created_at: new Date(at) });

describe('GET /api/v1/chat/conversations', () => {
    it('lists followed users, most recent conversation first', async () => {
        const [me, bob, carol, anna, stranger] = await Promise.all(
            ['myself', 'bob', 'carol', 'anna', 'stranger'].map((name) => createUser(name))
        );
        for (const user of [bob, carol, anna]) await api().put(`/api/v1/users/${user!.id}/follow`).set(me!.auth).expect(200);

        await message(me!.id, bob!.id, 'hi bob', '2026-10-01T09:00:00Z');
        await message(bob!.id, me!.id, 'hi back', '2026-10-01T12:00:00Z');
        await message(carol!.id, me!.id, 'hello', '2026-10-02T08:00:00Z');
        await message(stranger!.id, me!.id, 'spam', '2026-10-03T08:00:00Z');

        const res = await api().get('/api/v1/chat/conversations').set(me!.auth).expect(200);
        const conversations = res.body.map((c: unknown) => ConversationSchema.parse(c));
        expect(conversations.map((c: { user: { username: string }; lastMessageAt: string | null }) => [c.user.username, c.lastMessageAt])).toEqual([
            ['carol', '2026-10-02T08:00:00.000Z'],
            ['bob', '2026-10-01T12:00:00.000Z'],
            ['anna', null],
        ]);
    });
});

describe('GET /api/v1/chat/conversations/:userId/messages', () => {
    it('pages from the newest messages back, each page in chronological order', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        for (let i = 1; i <= 5; i++) {
            await message(i % 2 ? me.id : bob.id, i % 2 ? bob.id : me.id, `m${i}`, `2026-10-01T10:0${i}:00Z`);
        }

        const pages: string[][] = [];
        let cursor: number | null | undefined;
        do {
            const res = await api()
                .get(`/api/v1/chat/conversations/${bob.id}/messages`)
                .query({ limit: 2, ...(cursor && { cursor }) })
                .set(me.auth)
                .expect(200);
            const page = ChatMessagePageSchema.parse(res.body);
            pages.push(page.items.map((m) => m.content!));
            cursor = page.nextCursor;
        } while (cursor);

        expect(pages).toEqual([['m4', 'm5'], ['m2', 'm3'], ['m1']]);
    });

    it('validates the user id', async () => {
        const me = await createUser('myself');
        await api().get('/api/v1/chat/conversations/abc/messages').set(me.auth).expect(400);
    });
});

describe('POST /api/v1/chat/attachments', () => {
    it('stores an image and returns its URL', async () => {
        const me = await createUser('myself');
        const res = await api().post('/api/v1/chat/attachments').set(me.auth).attach('image', await testImage(), 'x.png').expect(201);
        expect(res.body.url).toMatch(/^\/uploads\/chat_images\/.+\.webp$/);
        expect(await uploadedFileExists(res.body.url)).toBe(true);
    });

    it('requires a file', async () => {
        const me = await createUser('myself');
        await api().post('/api/v1/chat/attachments').set(me.auth).expect(400);
    });
});

describe('GET /api/v1/users/me/events', () => {
    // Events have no create endpoint yet, so they are inserted directly.
    it('lists the events the user takes part in', async () => {
        const me = await createUser('myself');
        const event = await Event.create({ title: 'Meetup', image: 'events/meetup.webp', owner_id: me.id });
        await UserEvent.create({ user_id: me.id, event_id: event.event_id });

        const res = await api().get('/api/v1/users/me/events').set(me.auth).expect(200);
        expect(res.body.map((e: unknown) => EventSummarySchema.parse(e))).toEqual([
            expect.objectContaining({ title: 'Meetup', image: '/uploads/events/meetup.webp' }),
        ]);
    });
});
