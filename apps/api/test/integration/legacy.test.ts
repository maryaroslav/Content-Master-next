import { beforeEach, describe, expect, it } from 'vitest';
import {
    AuthTokenResponseSchema,
    ChatMessageSchema,
    CommunitySchema,
    ConversationSchema,
    PostSchema,
    PublicUserSchema,
    SearchResponseSchema,
    TwoFactorLoginResponseSchema,
    TwoFactorRequiredResponseSchema,
    UserProfileSchema,
} from '@cm/contracts/legacy';
import { Event, Message, UserEvent } from '../../src/models';
import { api, createUser, enableTwoFactor, resetDatabase, testImage, totpFor } from './helpers';

// The pre-v1 frontend still uses these routes; the tests pin the response shapes it relies on.
beforeEach(resetDatabase);

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('legacy auth', () => {
    it('logs in with and without 2FA', async () => {
        const alice = await createUser('alice');
        const plain = await api().post('/api/auth/login').send({ email: alice.email, password: alice.password }).expect(200);
        expect(AuthTokenResponseSchema.parse(plain.body).user.user_id).toBe(alice.id);

        await enableTwoFactor(alice);
        const step1 = await api().post('/api/auth/login').send({ email: alice.email, password: alice.password }).expect(200);
        const { challengeToken } = TwoFactorRequiredResponseSchema.parse(step1.body);

        const step2 = await api()
            .post('/api/auth/2fa/verify-login')
            .send({ challengeToken, token: await totpFor(alice.id) })
            .expect(200);
        expect(TwoFactorLoginResponseSchema.parse(step2.body).user.user_id).toBe(alice.id);
    });

    it('returns the current user in snake_case', async () => {
        const alice = await createUser('alice');
        const res = await api().get('/api/user/me').set(bearer(alice.accessToken)).expect(200);
        expect(PublicUserSchema.parse(res.body)).toMatchObject({ user_id: alice.id, profile_picture: null });
    });
});

describe('legacy users and follows', () => {
    it('shows a profile and the follow status', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        const profile = await api().get('/api/user/byusername/bob').set(bearer(alice.accessToken)).expect(200);
        expect(UserProfileSchema.parse(profile.body).user_id).toBe(bob.id);

        const follow = await api().post(`/api/follow/follow/${bob.id}`).set(bearer(alice.accessToken)).expect(200);
        expect(follow.body).toEqual({ success: true, created: true });
        const status = await api().get(`/api/follow/status/${bob.id}`).set(bearer(alice.accessToken)).expect(200);
        expect(status.body).toEqual({ isFollowing: true });
        const unfollow = await api().post(`/api/follow/unfollow/${bob.id}`).set(bearer(alice.accessToken)).expect(200);
        expect(unfollow.body).toEqual({ success: true, removed: true });
    });
});

describe('legacy posts', () => {
    it('creates, lists and deletes posts with image paths', async () => {
        const alice = await createUser('alice');
        const created = await api()
            .post('/api/posts')
            .set(bearer(alice.accessToken))
            .field({ title: 'Hello', content: 'World' })
            .attach('images', await testImage(), 'a.png')
            .expect(201);
        const post = PostSchema.parse(created.body);
        expect(post.image_url[0]).toMatch(/^\/uploads\/user_posts\/.+\.webp$/);

        const list = await api().get('/api/posts').set(bearer(alice.accessToken)).expect(200);
        expect(list.body.map((p: unknown) => PostSchema.parse(p).post_id)).toEqual([post.post_id]);

        const removed = await api().delete(`/api/posts/${post.post_id}`).set(bearer(alice.accessToken)).expect(200);
        expect(removed.body).toEqual({ message: 'Post deleted' });
    });
});

describe('legacy communities, events and search', () => {
    it('returns community photos as /uploads paths everywhere', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        const created = await api()
            .post('/api/createcommunity')
            .set(bearer(alice.accessToken))
            .field({ name: 'Gamers', privacy: 'public', theme: 'Games' })
            .attach('photo', await testImage(), 'p.png')
            .expect(201);
        const community = CommunitySchema.parse(created.body.community);
        expect(community.photo).toMatch(/^\/uploads\/communities_images\/.+\.webp$/);

        const owned = await api().get('/api/mycommunities').set(bearer(alice.accessToken)).expect(200);
        const member = await api().get('/api/user/usercommunities').set(bearer(alice.accessToken)).expect(200);
        const found = await api().get('/api/search').query({ q: 'Gam' }).set(bearer(bob.accessToken)).expect(200);

        expect(owned.body[0].photo).toBe(community.photo);
        expect(member.body[0].photo).toBe(community.photo);
        expect(SearchResponseSchema.parse(found.body).communities[0]!.photo).toBe(community.photo);
    });

    it('returns event images as /uploads paths', async () => {
        const alice = await createUser('alice');
        const event = await Event.create({ title: 'Meetup', image: 'events/meetup.webp', owner_id: alice.id });
        await UserEvent.create({ user_id: alice.id, event_id: event.event_id });

        const res = await api().get('/api/user/userevents').set(bearer(alice.accessToken)).expect(200);
        expect(res.body[0]).toMatchObject({ event_id: event.event_id, image: '/uploads/events/meetup.webp' });
    });
});

describe('legacy chat', () => {
    it('lists conversations and the full history with the sender', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        await api().post(`/api/follow/follow/${bob.id}`).set(bearer(alice.accessToken)).expect(200);
        await Message.create({ from_user_id: alice.id, to_user_id: bob.id, content: 'first', type: 'text' });
        await Message.create({ from_user_id: bob.id, to_user_id: alice.id, content: 'second', type: 'text' });

        const following = await api().get('/api/chat/following').set(bearer(alice.accessToken)).expect(200);
        expect(ConversationSchema.parse(following.body[0]).user_id).toBe(bob.id);

        const history = await api().get(`/api/chat/message/${bob.id}`).set(bearer(alice.accessToken)).expect(200);
        const messages = history.body.map((m: unknown) => ChatMessageSchema.parse(m));
        expect(messages.map((m: { content: string | null }) => m.content)).toEqual(['first', 'second']);
        expect(messages[0].FromUser).toMatchObject({ user_id: alice.id, username: 'alice' });

        const upload = await api().post('/api/chat/upload').set(bearer(alice.accessToken)).attach('image', await testImage(), 'x.png').expect(200);
        expect(upload.body.url).toMatch(/^\/uploads\/chat_images\/.+\.webp$/);
    });
});
