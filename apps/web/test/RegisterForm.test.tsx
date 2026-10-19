import { screen } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import RegisterForm from '@/app/(guest)/components/RegisterForm';
import { renderWithProviders } from './render';
import { apiError, server } from './server';

describe('RegisterForm', () => {
    it('puts a server field error on the matching field', async () => {
        server.use(http.post('*/auth/register', () => apiError(400, {
            code: 'VALIDATION_ERROR',
            message: 'This username is already taken',
            details: [{ path: 'body.username', message: 'This username is already taken' }],
        })));
        const { user } = renderWithProviders(<RegisterForm />);

        await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
        await user.type(screen.getByPlaceholderText('Password'), 'password123');
        await user.type(screen.getByPlaceholderText('Username'), 'taken');
        await user.click(screen.getByRole('button', { name: 'Sign Up' }));

        expect(await screen.findByText('This username is already taken')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Username')).toHaveClass('input-error');
        expect(screen.getByPlaceholderText('Email')).not.toHaveClass('input-error');
    });
});
