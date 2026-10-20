import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { getUsersFollowMockHandler, getUsersProfileMockHandler } from '@cm/api-client/mocks';
import ProfileView from '@/app/(protected)/profile/[username]/components/ProfileView';
import { bobProfile } from './fixtures';
import { renderWithProviders, signIn } from './render';
import { apiError, server } from './server';

async function openBob() {
    server.use(getUsersProfileMockHandler(bobProfile));
    await signIn();
    const view = renderWithProviders(<ProfileView username="bob" />);
    await screen.findByText('@bob · 4 followers');
    return view;
}

describe('FollowButton', () => {
    it('follows at once and keeps the server count', async () => {
        let respond!: () => void;
        const answered = new Promise<void>((resolve) => { respond = resolve; });
        server.use(getUsersFollowMockHandler(async () => {
            await answered;
            return { isFollowing: true, followersCount: 7 };
        }));
        const { user } = await openBob();

        await user.click(screen.getByRole('button', { name: 'Add to friends' }));
        expect(screen.getByRole('button', { name: 'Unfriend' })).toBeInTheDocument();
        expect(screen.getByText('@bob · 5 followers')).toBeInTheDocument();

        respond();
        expect(await screen.findByText('@bob · 7 followers')).toBeInTheDocument();
    });

    it('rolls back and shows the error when the request fails', async () => {
        server.use(http.put('*/users/:userId/follow', () => apiError(500, { code: 'INTERNAL_ERROR', message: 'Internal server error' })));
        const { user } = await openBob();

        await user.click(screen.getByRole('button', { name: 'Add to friends' }));

        expect(await screen.findByText('Something went wrong, please try again.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add to friends' })).toBeInTheDocument();
        expect(screen.getByText('@bob · 4 followers')).toBeInTheDocument();
    });
});
