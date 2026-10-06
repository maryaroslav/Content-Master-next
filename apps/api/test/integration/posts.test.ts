import { beforeEach, describe, expect, it } from 'vitest';
import { PostPageSchema, PostSchema } from '@cm/contracts';
import { PostImage } from '../../src/models';
import { api, createUser, resetDatabase, testImage, uploadedFileExists, type TestUser } from './helpers';

beforeEach(resetDatabase);

const createPost = (user: TestUser, title: string) => api().post('/api/v1/posts').set(user.auth).field('title', title).expect(201);

describe('POST /api/v1/posts', () => {
    it('stores images in the order they were sent', async () => {
        const alice = await createUser('alice');
        const res = await api()
            .post('/api/v1/posts')
            .set(alice.auth)
            .field('title', 'Holiday')
            .attach('images', await testImage(300, 200), 'first.png')
            .attach('images', await testImage(200, 300), 'second.png')
            .expect(201);

        const post = PostSchema.parse(res.body);
        expect(post).toMatchObject({ title: 'Holiday', authorId: alice.id, author: { username: 'alice' } });
        expect(post.images).toHaveLength(2);
        for (const url of post.images) expect(await uploadedFileExists(url)).toBe(true);

        const rows = await PostImage.findAll({ where: { post_id: post.id }, order: [['position', 'ASC']] });
        expect(rows.map((row) => `/uploads/${row.image_key}`)).toEqual(post.images);
    });

    it('rejects non-images and more than 5 files', async () => {
        const alice = await createUser('alice');
        const fake = await api()
            .post('/api/v1/posts')
            .set(alice.auth)
            .attach('images', Buffer.from('nope'), { filename: 'x.png', contentType: 'image/png' });
        expect([fake.status, fake.body.code]).toEqual([400, 'INVALID_FILE_TYPE']);

        let tooMany = api().post('/api/v1/posts').set(alice.auth);
        const image = await testImage();
        for (let i = 0; i < 6; i++) tooMany = tooMany.attach('images', image, `${i}.png`);
        expect((await tooMany).status).toBe(400);
    });

    it('requires authentication', async () => {
        await api().post('/api/v1/posts').field('title', 'x').expect(401);
    });
});

describe('GET /api/v1/posts', () => {
    it('pages through the feed, newest first', async () => {
        const alice = await createUser('alice');
        for (const title of ['p1', 'p2', 'p3', 'p4', 'p5']) await createPost(alice, title);

        const titles: string[][] = [];
        let cursor: number | null | undefined;
        do {
            const res = await api().get('/api/v1/posts').query({ limit: 2, ...(cursor && { cursor }) }).set(alice.auth).expect(200);
            const page = PostPageSchema.parse(res.body);
            titles.push(page.items.map((post) => post.title!));
            cursor = page.nextCursor;
        } while (cursor);

        expect(titles).toEqual([['p5', 'p4'], ['p3', 'p2'], ['p1']]);
    });

    it('validates the limit', async () => {
        const alice = await createUser('alice');
        await api().get('/api/v1/posts').query({ limit: 51 }).set(alice.auth).expect(400);
    });
});

describe('DELETE /api/v1/posts/:postId', () => {
    it('lets only the author delete, and removes the images', async () => {
        const [alice, bob] = [await createUser('alice'), await createUser('bob')];
        const created = await api().post('/api/v1/posts').set(alice.auth).attach('images', await testImage(), 'a.png').expect(201);
        const { id, images } = PostSchema.parse(created.body);

        const forbidden = await api().delete(`/api/v1/posts/${id}`).set(bob.auth);
        expect([forbidden.status, forbidden.body.code]).toEqual([403, 'FORBIDDEN']);

        await api().delete(`/api/v1/posts/${id}`).set(alice.auth).expect(204);
        expect(await uploadedFileExists(images[0]!)).toBe(false);
        expect(await PostImage.count({ where: { post_id: id } })).toBe(0);

        const gone = await api().delete(`/api/v1/posts/${id}`).set(alice.auth);
        expect([gone.status, gone.body.code]).toEqual([404, 'POST_NOT_FOUND']);
    });
});
