import { screen, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { getAuthLoginMockHandler } from '@cm/api-client/mocks';
import { authStore } from '@cm/auth';
import LoginForm from '@/app/(guest)/components/LoginForm';
import { me } from './fixtures';
import { renderWithProviders } from './render';
import { apiError, server } from './server';

async function submit(email: string, password: string) {
    const view = renderWithProviders(<LoginForm />);
    if (email) await view.user.type(screen.getByPlaceholderText('Email'), email);
    if (password) await view.user.type(screen.getByPlaceholderText('Password'), password);
    await view.user.click(screen.getByRole('button', { name: 'Sign In' }));
    return view;
}

describe('LoginForm', () => {
    it('validates before calling the API', async () => {
        await submit('', '');
        expect(await screen.findByText('Email is required')).toBeInTheDocument();
    });

    it('shows the translated API error', async () => {
        server.use(http.post('*/auth/login', () => apiError(401, { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' })));
        await submit(me.email, 'wrong-password');
        expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    });

    it('starts the session', async () => {
        server.use(getAuthLoginMockHandler({ accessToken: 'token', user: me }));
        await submit(me.email, 'password123');
        await waitFor(() => expect(authStore.getState()).toMatchObject({ status: 'authenticated', user: me }));
    });

    it('asks for the 2FA code when the account has it on', async () => {
        server.use(getAuthLoginMockHandler({ twoFactorRequired: true, challengeToken: 'challenge' }));
        await submit(me.email, 'password123');
        expect(await screen.findByText('Enter the code from your authenticator app')).toBeInTheDocument();
        expect(authStore.getState().status).not.toBe('authenticated');
    });
});
