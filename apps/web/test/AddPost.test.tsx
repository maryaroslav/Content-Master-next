import { screen, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { getPostsCreateMockHandler } from '@cm/api-client/mocks';
import AddPost from '@/app/(protected)/(main)/explore/components/AddPost';
import { feedQueryKey, type FeedData } from '@/app/(protected)/(main)/explore/components/feedCache';
import { post } from './fixtures';
import { renderWithProviders, signIn } from './render';
import { apiError, server } from './server';

async function setup() {
    await signIn();
    const view = renderWithProviders(<AddPost />);
    view.queryClient.setQueryData<FeedData>(feedQueryKey, {
        pages: [{ items: [post(1, 'older')], nextCursor: null }],
        pageParams: [undefined],
    });
    return view;
}

describe('AddPost', () => {
    it('puts the created post at the top of the feed and clears the input', async () => {
        server.use(getPostsCreateMockHandler(post(2, 'Hello there')));
        const { user, queryClient } = await setup();
        const input = screen.getByPlaceholderText('Share your thoughts or a post');

        await user.type(input, 'Hello there{Enter}');

        await waitFor(() => expect(queryClient.getQueryData<FeedData>(feedQueryKey)?.pages[0]?.items.map((p) => p.id)).toEqual([2, 1]));
        expect(input).toHaveValue('');
    });

    it('keeps the text and shows the error when the post is rejected', async () => {
        server.use(http.post('*/posts', () => apiError(500, { code: 'INTERNAL_ERROR', message: 'Internal server error' })));
        const { user } = await setup();
        const input = screen.getByPlaceholderText('Share your thoughts or a post');

        await user.type(input, 'Hello there{Enter}');

        expect(await screen.findByText('Something went wrong, please try again.')).toBeInTheDocument();
        expect(input).toHaveValue('Hello there');
    });
});
