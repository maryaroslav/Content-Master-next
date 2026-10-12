import { beforeEach, describe, expect, it } from 'vitest';
import { FollowStatusSchema, UserProfileSchema, UserSchema } from '@cm/contracts';
import { api, createUser, resetDatabase, testImage, uploadedFileExists } from './helpers';

beforeEach(resetDatabase);

describe('GET /api/v1/users/me', () => {
    it('returns the current user', async () => {
        const alice = await createUser('alice');
        const res = await api().get('/api/v1/users/me').set(alice.auth).expect(200);
        expect(UserSchema.parse(res.body).id).toBe(alice.id);
    });

    it('requires a valid token', async () => {
        const missing = await api().get('/api/v1/users/me');
        const invalid = await api().get('/api/v1/users/me').set('Authorization', 'Bearer nope');
        expect([missing.status, missing.body.code]).toEqual([401, 'UNAUTHORIZED']);
        expect([invalid.status, invalid.body.code]).toEqual([401, 'INVALID_TOKEN']);
    });
});

describe('profiles and following', () => {
    it('shows followers and whether the viewer follows', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];

        const before = await api().get('/api/v1/users/by-username/bob').set(alice.auth).expect(200);
        expect(UserProfileSchema.parse(before.body)).toMatchObject({ id: bob.id, followersCount: 0, isFollowing: false });

        const follow = await api().put(`/api/v1/users/${bob.id}/follow`).set(alice.auth).expect(200);
        expect(FollowStatusSchema.parse(follow.body)).toEqual({ isFollowing: true, followersCount: 1 });

        const again = await api().put(`/api/v1/users/${bob.id}/follow`).set(alice.auth).expect(200);
        expect(again.body).toEqual({ isFollowing: true, followersCount: 1 });

        const unfollow = await api().delete(`/api/v1/users/${bob.id}/follow`).set(alice.auth).expect(200);
        expect(unfollow.body).toEqual({ isFollowing: false, followersCount: 0 });
    });

    it('rejects following yourself or an unknown user', async () => {
        const alice = await createUser('alice');
        const self = await api().put(`/api/v1/users/${alice.id}/follow`).set(alice.auth);
        const unknown = await api().put('/api/v1/users/999/follow').set(alice.auth);
        const invalid = await api().put('/api/v1/users/abc/follow').set(alice.auth);
        expect([self.status, self.body.code]).toEqual([400, 'CANNOT_FOLLOW_SELF']);
        expect([unknown.status, unknown.body.code]).toEqual([404, 'USER_NOT_FOUND']);
        expect(invalid.status).toBe(400);
    });

    it('returns 404 for an unknown username', async () => {
        const alice = await createUser('alice');
        await api().get('/api/v1/users/by-username/nobody').set(alice.auth).expect(404);
    });
});

describe('PATCH /api/v1/users/me', () => {
    it('updates and clears profile fields', async () => {
        const alice = await createUser('alice');
        const updated = await api().patch('/api/v1/users/me').set(alice.auth).send({ fullName: '  Alice Smith ', bio: 'Hi' }).expect(200);
        expect(UserSchema.parse(updated.body)).toMatchObject({ fullName: 'Alice Smith', bio: 'Hi' });

        const cleared = await api().patch('/api/v1/users/me').set(alice.auth).send({ bio: null }).expect(200);
        expect(cleared.body).toMatchObject({ fullName: 'Alice Smith', bio: null });
    });

    it('changes the username', async () => {
        const alice = await createUser('alice');
        await createUser('bob');

        await api().patch('/api/v1/users/me').set(alice.auth).send({ username: 'alice_new' }).expect(200);
        await api().get('/api/v1/users/by-username/alice').set(alice.auth).expect(404);
        await api().get('/api/v1/users/by-username/alice_new').set(alice.auth).expect(200);

        const taken = await api().patch('/api/v1/users/me').set(alice.auth).send({ username: 'bob' });
        expect([taken.status, taken.body.code]).toEqual([409, 'USERNAME_TAKEN']);
        await api().patch('/api/v1/users/me').set(alice.auth).send({ username: 'a b' }).expect(400);
    });

    it('rejects an empty update and ignores the email field', async () => {
        const alice = await createUser('alice');
        const empty = await api().patch('/api/v1/users/me').set(alice.auth).send({});
        expect([empty.status, empty.body.message]).toEqual([400, 'Nothing to update']);

        const sneaky = await api().patch('/api/v1/users/me').set(alice.auth).send({ email: 'x@example.com', bio: 'x' }).expect(200);
        expect(sneaky.body.email).toBe('alice@example.com');
    });
});

describe('PUT /api/v1/users/me/email', () => {
    it('needs the current password', async () => {
        const alice = await createUser('alice');
        const res = await api().put('/api/v1/users/me/email').set(alice.auth).send({ email: 'new@example.com', currentPassword: 'nope' });
        expect([res.status, res.body.code]).toEqual([403, 'INVALID_PASSWORD']);
    });

    it('rejects an email that is taken', async () => {
        const alice = await createUser('alice');
        await createUser('bob');
        const res = await api().put('/api/v1/users/me/email').set(alice.auth).send({ email: 'bob@example.com', currentPassword: alice.password });
        expect([res.status, res.body.code]).toEqual([409, 'EMAIL_TAKEN']);
    });

    it('changes the login email', async () => {
        const alice = await createUser('alice');
        await api().put('/api/v1/users/me/email').set(alice.auth).send({ email: 'alice.new@example.com', currentPassword: alice.password }).expect(200);
        await api().post('/api/v1/auth/login').send({ email: 'alice.new@example.com', password: alice.password }).expect(200);
        await api().post('/api/v1/auth/login').send({ email: 'alice@example.com', password: alice.password }).expect(401);
    });
});

describe('avatar', () => {
    it('is uploaded, replaced and removed together with its file', async () => {
        const alice = await createUser('alice');

        const first = await api().put('/api/v1/users/me/avatar').set(alice.auth).attach('avatar', await testImage(800, 600), 'a.png').expect(200);
        const firstUrl = UserSchema.parse(first.body).profilePicture!;
        expect(firstUrl).toMatch(/^\/uploads\/avatars\/.+\.webp$/);
        expect(await uploadedFileExists(firstUrl)).toBe(true);

        const second = await api().put('/api/v1/users/me/avatar').set(alice.auth).attach('avatar', await testImage(), 'b.png').expect(200);
        expect(await uploadedFileExists(firstUrl)).toBe(false);

        const removed = await api().delete('/api/v1/users/me/avatar').set(alice.auth).expect(200);
        expect(removed.body.profilePicture).toBeNull();
        expect(await uploadedFileExists(second.body.profilePicture)).toBe(false);
    });

    it('rejects a missing file and non-images', async () => {
        const alice = await createUser('alice');
        await api().put('/api/v1/users/me/avatar').set(alice.auth).expect(400);
        const fake = await api()
            .put('/api/v1/users/me/avatar')
            .set(alice.auth)
            .attach('avatar', Buffer.from('not an image'), { filename: 'fake.png', contentType: 'image/png' });
        expect([fake.status, fake.body.code]).toEqual([400, 'INVALID_FILE_TYPE']);
    });
});
