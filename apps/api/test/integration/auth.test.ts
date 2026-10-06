import { beforeEach, describe, expect, it } from 'vitest';
import { AuthSessionSchema, TwoFactorChallengeSchema, UserSchema } from '@cm/contracts';
import { User } from '../../src/models';
import { api, cookieValue, createUser, enableTwoFactor, refreshCookie, resetDatabase, totpFor } from './helpers';

beforeEach(resetDatabase);

const credentials = { email: 'alice@example.com', password: 'password123' };

describe('POST /api/v1/auth/register', () => {
    it('creates a user', async () => {
        const res = await api().post('/api/v1/auth/register').send({ ...credentials, username: 'alice' }).expect(201);
        expect(UserSchema.parse(res.body)).toMatchObject({ username: 'alice', email: 'alice@example.com', twoFactorEnabled: false });
    });

    it('rejects a taken email or username', async () => {
        await createUser('alice');
        const sameEmail = await api().post('/api/v1/auth/register').send({ ...credentials, username: 'other' });
        const sameName = await api().post('/api/v1/auth/register').send({ email: 'other@example.com', password: 'password123', username: 'alice' });
        expect([sameEmail.status, sameEmail.body.code]).toEqual([409, 'USER_EXISTS']);
        expect([sameName.status, sameName.body.code]).toEqual([409, 'USER_EXISTS']);
    });

    it('validates the input', async () => {
        const res = await api().post('/api/v1/auth/register').send({ email: 'nope', password: '123', username: 'a b' }).expect(400);
        expect(res.body.details.map((d: { path: string }) => d.path)).toEqual(['body.email', 'body.password', 'body.username']);
    });
});

describe('POST /api/v1/auth/login', () => {
    it('returns a session and sets the refresh cookie', async () => {
        await createUser('alice');
        const res = await api().post('/api/v1/auth/login').send(credentials).expect(200);

        expect(AuthSessionSchema.parse(res.body).user.username).toBe('alice');
        const cookie = refreshCookie(res);
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/Path=\/api\/v1\/auth/);
    });

    it('gives the same answer for a wrong password and an unknown email', async () => {
        await createUser('alice');
        const wrongPassword = await api().post('/api/v1/auth/login').send({ ...credentials, password: 'wrong-pass' });
        const unknownEmail = await api().post('/api/v1/auth/login').send({ ...credentials, email: 'nobody@example.com' });
        expect([wrongPassword.status, wrongPassword.body]).toEqual([unknownEmail.status, unknownEmail.body]);
        expect(wrongPassword.body.code).toBe('INVALID_CREDENTIALS');
    });
});

describe('refresh and logout', () => {
    async function loginCookie() {
        await createUser('alice');
        return cookieValue(refreshCookie(await api().post('/api/v1/auth/login').send(credentials)));
    }

    it('rotates the refresh token', async () => {
        const first = await loginCookie();
        const res = await api().post('/api/v1/auth/refresh').set('Cookie', first).expect(200);
        expect(AuthSessionSchema.parse(res.body).user.username).toBe('alice');
        expect(cookieValue(refreshCookie(res))).not.toBe(first);
    });

    it('revokes the whole session when a rotated token is reused', async () => {
        const first = await loginCookie();
        const second = cookieValue(refreshCookie(await api().post('/api/v1/auth/refresh').set('Cookie', first)));

        const reuse = await api().post('/api/v1/auth/refresh').set('Cookie', first).expect(401);
        expect(reuse.body.code).toBe('INVALID_REFRESH_TOKEN');
        await api().post('/api/v1/auth/refresh').set('Cookie', second).expect(401);
    });

    it('requires the cookie', async () => {
        await api().post('/api/v1/auth/refresh').expect(401);
    });

    it('logout ends the session', async () => {
        const cookie = await loginCookie();
        await api().post('/api/v1/auth/logout').set('Cookie', cookie).expect(204);
        await api().post('/api/v1/auth/refresh').set('Cookie', cookie).expect(401);
    });
});

describe('two-factor authentication', () => {
    it('stores the secret encrypted', async () => {
        const alice = await createUser('alice');
        await api().post('/api/v1/auth/2fa/setup').set(alice.auth).expect(200);
        const user = await User.findByPk(alice.id);
        expect(user!.twoFactorSecret).toMatch(/^v1:/);
    });

    it('is enabled only with a valid code', async () => {
        const alice = await createUser('alice');
        const setup = await api().post('/api/v1/auth/2fa/setup').set(alice.auth).expect(200);
        expect(setup.body.qrCode).toMatch(/^data:image\/png;base64,/);

        const wrong = await api().post('/api/v1/auth/2fa/enable').set(alice.auth).send({ code: '000000' });
        expect([wrong.status, wrong.body.code]).toEqual([401, 'INVALID_2FA_CODE']);

        const ok = await api().post('/api/v1/auth/2fa/enable').set(alice.auth).send({ code: await totpFor(alice.id) }).expect(200);
        expect(UserSchema.parse(ok.body).twoFactorEnabled).toBe(true);

        const again = await api().post('/api/v1/auth/2fa/setup').set(alice.auth);
        expect([again.status, again.body.code]).toEqual([409, 'TWO_FACTOR_ALREADY_ENABLED']);
    });

    it('turns login into a two-step flow', async () => {
        const alice = await createUser('alice');
        await enableTwoFactor(alice);

        const step1 = await api().post('/api/v1/auth/login').send(credentials).expect(200);
        const { challengeToken } = TwoFactorChallengeSchema.parse(step1.body);
        expect(step1.headers['set-cookie']).toBeUndefined();

        await api().get('/api/v1/users/me').set('Authorization', `Bearer ${challengeToken}`).expect(401);

        const wrong = await api().post('/api/v1/auth/2fa/login').send({ challengeToken, code: '000000' });
        expect([wrong.status, wrong.body.code]).toEqual([401, 'INVALID_2FA_CODE']);

        const step2 = await api().post('/api/v1/auth/2fa/login').send({ challengeToken, code: await totpFor(alice.id) }).expect(200);
        expect(AuthSessionSchema.parse(step2.body).user.id).toBe(alice.id);
        refreshCookie(step2);
    });

    it('is disabled only with a valid code', async () => {
        const alice = await createUser('alice');
        await enableTwoFactor(alice);

        await api().post('/api/v1/auth/2fa/disable').set(alice.auth).send({ code: '000000' }).expect(401);
        const ok = await api().post('/api/v1/auth/2fa/disable').set(alice.auth).send({ code: await totpFor(alice.id) }).expect(200);
        expect(ok.body.twoFactorEnabled).toBe(false);

        const login = await api().post('/api/v1/auth/login').send(credentials).expect(200);
        expect(AuthSessionSchema.safeParse(login.body).success).toBe(true);
    });

    it('requires authentication to manage 2FA', async () => {
        await api().post('/api/v1/auth/2fa/setup').expect(401);
    });
});
