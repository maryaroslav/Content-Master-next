import { describe, expect, it } from 'vitest';
import { prependPost, removePost, type FeedData } from '@/app/(protected)/(main)/explore/components/feedCache';
import { post } from './fixtures';

const feed = (...pages: number[][]): FeedData => ({
    pages: pages.map((ids) => ({ items: ids.map((id) => post(id, `post ${id}`)), nextCursor: null })),
    pageParams: pages.map(() => undefined),
});

const ids = (data: FeedData | undefined) => data?.pages.map((page) => page.items.map((item) => item.id));

describe('feedCache', () => {
    it('puts a created post at the top of the first page', () => {
        expect(ids(prependPost(feed([3, 2], [1]), post(4, 'new')))).toEqual([[4, 3, 2], [1]]);
    });

    it('leaves a feed that is not loaded yet alone', () => {
        expect(prependPost(undefined, post(4, 'new'))).toBeUndefined();
    });

    it('removes a post from whichever page holds it', () => {
        expect(ids(removePost(feed([3, 2], [1]), 1))).toEqual([[3, 2], []]);
    });
});
