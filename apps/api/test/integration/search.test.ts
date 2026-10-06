import { beforeEach, describe, expect, it } from 'vitest';
import { SearchResponseSchema } from '@cm/contracts';
import { api, createUser, resetDatabase, testImage, type TestUser } from './helpers';

beforeEach(resetDatabase);

const search = async (user: TestUser, q: string) => {
    const res = await api().get('/api/v1/search').query({ q }).set(user.auth).expect(200);
    return SearchResponseSchema.parse(res.body);
};

describe('GET /api/v1/search', () => {
    it('needs at least 2 characters', async () => {
        const alice = await createUser('alice');
        await api().get('/api/v1/search').query({ q: 'a' }).set(alice.auth).expect(400);
    });

    it('treats % and _ literally', async () => {
        const alice = await createUser('alice');
        await createUser('x_y');
        await createUser('xay');

        expect((await search(alice, 'x_')).users.map((u) => u.username)).toEqual(['x_y']);
        expect((await search(alice, '%y')).users).toEqual([]);
    });

    it('leaves out the viewer and their own communities', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('alicia')];
        for (const [owner, name] of [[alice, 'Alpine club'], [bob, 'Alpine fans']] as const) {
            await api()
                .post('/api/v1/communities')
                .set(owner.auth)
                .field({ name, privacy: 'public', theme: 'Sport' })
                .attach('photo', await testImage(), 'p.png')
                .expect(201);
        }

        const result = await search(alice, 'Al');
        expect(result.users.map((u) => u.username)).toEqual(['alicia']);
        expect(result.communities.map((c) => c.name)).toEqual(['Alpine fans']);
    });

    it('tells whether the viewer is a member of each community', async () => {
        const [owner, viewer] = [await createUser('owner'), await createUser('viewer')];
        const ids: number[] = [];
        for (const name of ['Chess club', 'Chess fans']) {
            const res = await api()
                .post('/api/v1/communities')
                .set(owner.auth)
                .field({ name, privacy: 'public', theme: 'Games' })
                .attach('photo', await testImage(), 'p.png')
                .expect(201);
            ids.push(res.body.id);
        }
        await api().post(`/api/v1/communities/${ids[0]}/membership`).set(viewer.auth).expect(200);

        const result = await search(viewer, 'Chess');
        expect(result.communities.map((c) => [c.name, c.isMember])).toEqual([['Chess club', true], ['Chess fans', false]]);
    });
});
