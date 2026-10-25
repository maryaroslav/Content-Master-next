import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CreateCommunityDialog from '@/app/(protected)/(main)/community/components/modal/Modal';
import { renderWithProviders } from './render';

function Harness() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>open</button>
            <CreateCommunityDialog open={open} onClose={() => setOpen(false)} />
        </>
    );
}

describe('CreateCommunityDialog', () => {
    it('checks each step before moving on and starts over when opened again', async () => {
        const { user } = renderWithProviders(<Harness />);
        await user.click(screen.getByRole('button', { name: 'open' }));

        expect(screen.getByRole('dialog', { name: 'What is your goal?' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /Share content and communicate/ }));

        await user.click(screen.getByRole('button', { name: 'Continue' }));
        const name = screen.getByLabelText('Community name');
        expect(name).toBeInvalid();
        expect(name).toHaveAccessibleDescription('Name is required');

        await user.type(name, 'Hikers');
        expect(screen.getByText('6/48')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Continue' }));
        expect(screen.getByRole('dialog', { name: 'Choose a theme' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Continue' }));
        expect(screen.getByRole('alert')).toHaveTextContent('Theme is required');
        await user.click(screen.getByRole('radio', { name: 'Cooking and Recipes' }));
        expect(screen.queryByRole('alert')).toBeNull();

        await user.keyboard('{Escape}');
        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
        await user.click(screen.getByRole('button', { name: 'open' }));
        expect(screen.getByRole('dialog', { name: 'What is your goal?' })).toBeInTheDocument();
    });
});
