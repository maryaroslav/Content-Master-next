import { beforeEach, describe, expect, it } from 'vitest';
import { api, createUser, resetDatabase } from './helpers';

beforeEach(resetDatabase);

describe('integration test setup', () => {
    it('runs against a migrated database with the full app', async () => {
        const alice = await createUser('alice');
        const me = await api().get('/api/v1/users/me').set(alice.auth).expect(200);
        expect(me.body).toMatchObject({ id: alice.id, username: 'alice', email: 'alice@example.com' });
    });

    it('starts every test from an empty database', async () => {
        const res = await api().post('/api/v1/auth/login').send({ email: 'alice@example.com', password: 'password123' });
        expect(res.status).toBe(401);
    });
});
