import { beforeEach, describe, expect, it } from 'vitest';
import { AttachmentSchema, ChatMessagePageSchema, ConversationSchema, EventSummarySchema } from '@cm/contracts';
import { Attachment, Event, Message, UserEvent } from '../../src/models';
import { sendMessage } from '../../src/modules/chat/service';
import { api, createUser, resetDatabase, testImage, uploadedFileExists, type TestUser } from './helpers';

beforeEach(resetDatabase);

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

const upload = async (user: TestUser, width = 64, height = 64) => {
    const res = await api().post('/api/v1/chat/attachments').set(user.auth).attach('image', await testImage(width, height), 'x.png').expect(201);
    return AttachmentSchema.parse(res.body);
};

describe('POST /api/v1/chat/attachments', () => {
    it('stores an image as an unsent attachment of the uploader', async () => {
        const me = await createUser('myself');
        const attachment = await upload(me, 80, 40);
        expect(attachment).toMatchObject({ mimeType: 'image/webp', width: 80, height: 40 });
        expect(attachment.url).toMatch(/^\/uploads\/chat_images\/.+\.webp$/);
        expect(await uploadedFileExists(attachment.url)).toBe(true);
        expect(await Attachment.findByPk(attachment.id)).toMatchObject({ uploader_id: me.id, message_id: null });
    });

    it('requires a file', async () => {
        const me = await createUser('myself');
        await api().post('/api/v1/chat/attachments').set(me.auth).expect(400);
    });
});

describe('sendMessage', () => {
    it('attaches uploaded images and returns them in the history', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        const [first, second] = [await upload(me), await upload(me)];

        await sendMessage(me.id, { toUserId: bob.id, text: ' look ', attachmentIds: [second.id, first.id] });

        const res = await api().get(`/api/v1/chat/conversations/${me.id}/messages`).set(bob.auth).expect(200);
        const [sent] = ChatMessagePageSchema.parse(res.body).items;
        expect(sent).toMatchObject({ content: 'look', type: 'image' });
        expect(sent!.attachments.map((a) => a.id)).toEqual([first.id, second.id]);
    });

    it('rejects attachments of another user or already sent ones', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        const mine = await upload(me);
        const bobs = await upload(bob);

        await expect(sendMessage(me.id, { toUserId: bob.id, attachmentIds: [bobs.id] })).rejects.toMatchObject({ code: 'INVALID_ATTACHMENT' });
        await sendMessage(me.id, { toUserId: bob.id, attachmentIds: [mine.id] });
        await expect(sendMessage(me.id, { toUserId: bob.id, attachmentIds: [mine.id] })).rejects.toMatchObject({ code: 'INVALID_ATTACHMENT' });
        expect(await Message.count()).toBe(1);
    });

    it('rejects empty messages, unknown recipients and messages to oneself', async () => {
        const [me, bob] = [await createUser('myself'), await createUser('bob')];
        await expect(sendMessage(me.id, { toUserId: bob.id, text: '   ' })).rejects.toMatchObject({ code: 'EMPTY_MESSAGE' });
        await expect(sendMessage(me.id, { toUserId: 999999, text: 'hi' })).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
        await expect(sendMessage(me.id, { toUserId: me.id, text: 'hi' })).rejects.toMatchObject({ code: 'CANNOT_MESSAGE_SELF' });
        expect(await Message.count()).toBe(0);
    });
});

describe('GET /api/v1/users/me/events', () => {
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
