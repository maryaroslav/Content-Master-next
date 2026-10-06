import { beforeEach, describe, expect, it } from 'vitest';
import { CommunitySchema, CommunitySummarySchema, MembershipStatusSchema } from '@cm/contracts';
import { api, createUser, resetDatabase, testImage, uploadedFileExists, type TestUser } from './helpers';

beforeEach(resetDatabase);

async function createCommunity(owner: TestUser, name: string, privacy: 'public' | 'private' = 'public') {
    const res = await api()
        .post('/api/v1/communities')
        .set(owner.auth)
        .field({ name, privacy, theme: 'Games' })
        .attach('photo', await testImage(), 'photo.png')
        .expect(201);
    return CommunitySchema.parse(res.body);
}

describe('POST /api/v1/communities', () => {
    it('creates a community with its owner as the first member', async () => {
        const alice = await createUser('alice');
        const community = await createCommunity(alice, 'Gamers');
        expect(community).toMatchObject({ name: 'Gamers', ownerId: alice.id, membersCount: 1 });
        expect(community.photo).toMatch(/^\/uploads\/communities_images\/.+\.webp$/);
        expect(await uploadedFileExists(community.photo)).toBe(true);
    });

    it('requires a photo and the text fields', async () => {
        const alice = await createUser('alice');
        const noPhoto = await api().post('/api/v1/communities').set(alice.auth).field({ name: 'X', privacy: 'public', theme: 'Games' });
        expect(noPhoto.body).toMatchObject({ code: 'VALIDATION_ERROR', message: 'Community photo is required' });

        const noName = await api()
            .post('/api/v1/communities')
            .set(alice.auth)
            .field({ privacy: 'public', theme: 'Games' })
            .attach('photo', await testImage(), 'p.png');
        expect(noName.status).toBe(400);
    });
});

describe('listing communities', () => {
    it('lists owned communities only with ?owner=me', async () => {
        const alice = await createUser('alice');
        await createCommunity(alice, 'First');
        await createCommunity(alice, 'Second');

        const owned = await api().get('/api/v1/communities').query({ owner: 'me' }).set(alice.auth).expect(200);
        expect(owned.body.map((c: { name: string }) => c.name)).toEqual(['Second', 'First']);
        await api().get('/api/v1/communities').set(alice.auth).expect(400);
    });

    it('lists the communities the user belongs to', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        const gamers = await createCommunity(alice, 'Gamers');
        await api().post(`/api/v1/communities/${gamers.id}/membership`).set(bob.auth).expect(200);

        const res = await api().get('/api/v1/users/me/communities').set(bob.auth).expect(200);
        expect(res.body.map((c: unknown) => CommunitySummarySchema.parse(c).name)).toEqual(['Gamers']);
    });
});

describe('membership', () => {
    it('joins and leaves, keeping the member count exact', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        const { id } = await createCommunity(alice, 'Gamers');

        const joined = await api().post(`/api/v1/communities/${id}/membership`).set(bob.auth).expect(200);
        expect(MembershipStatusSchema.parse(joined.body)).toEqual({ isMember: true, membersCount: 2 });

        const again = await api().post(`/api/v1/communities/${id}/membership`).set(bob.auth).expect(200);
        expect(again.body.membersCount).toBe(2);

        const left = await api().delete(`/api/v1/communities/${id}/membership`).set(bob.auth).expect(200);
        expect(left.body).toEqual({ isMember: false, membersCount: 1 });
    });

    it('keeps private communities closed and the owner inside', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        const secret = await createCommunity(alice, 'Secret', 'private');

        const join = await api().post(`/api/v1/communities/${secret.id}/membership`).set(bob.auth);
        expect([join.status, join.body.code]).toEqual([403, 'PRIVATE_COMMUNITY']);

        const ownerLeaves = await api().delete(`/api/v1/communities/${secret.id}/membership`).set(alice.auth);
        expect([ownerLeaves.status, ownerLeaves.body.code]).toEqual([400, 'OWNER_CANNOT_LEAVE']);

        const unknown = await api().post('/api/v1/communities/999/membership').set(bob.auth);
        expect([unknown.status, unknown.body.code]).toEqual([404, 'COMMUNITY_NOT_FOUND']);
    });

    it('counts concurrent joins correctly', async () => {
        const alice = await createUser('alice');
        const { id } = await createCommunity(alice, 'Busy');
        const users = await Promise.all(['user1', 'user2', 'user3', 'user4', 'user5'].map((name) => createUser(name)));

        await Promise.all(users.map((user) => api().post(`/api/v1/communities/${id}/membership`).set(user.auth).expect(200)));

        const owned = await api().get('/api/v1/communities').query({ owner: 'me' }).set(alice.auth);
        expect(owned.body[0].membersCount).toBe(6);
    });
});
