import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FeedPost from '@/app/(protected)/(main)/explore/components/FeedPost';
import { me, post } from './fixtures';
import { renderWithProviders, signIn } from './render';

describe('FeedPost', () => {
    it('deletes the own post only after the confirmation', async () => {
        await signIn();
        const onDelete = vi.fn();
        const { user } = renderWithProviders(<FeedPost post={post(1, 'Autumn in Prague')} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: 'Post options' }));
        await user.click(screen.getByRole('menuitem', { name: 'Delete post' }));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
        expect(onDelete).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Post options' }));
        await user.click(screen.getByRole('menuitem', { name: 'Delete post' }));
        await user.click(screen.getByRole('button', { name: 'Delete post' }));
        expect(onDelete).toHaveBeenCalledOnce();
    });

    it('has no options on posts by others', async () => {
        await signIn();
        const other = { ...post(2, 'Hello'), authorId: me.id + 1, author: { id: me.id + 1, username: 'tomas.dev', profilePicture: null } };
        renderWithProviders(<FeedPost post={other} onDelete={vi.fn()} />);

        expect(screen.getByRole('link', { name: 'tomas.dev' })).toHaveAttribute('href', '/profile/tomas.dev');
        expect(screen.queryByRole('button', { name: 'Post options' })).toBeNull();
    });
});
