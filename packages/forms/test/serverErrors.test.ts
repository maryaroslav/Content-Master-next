import { describe, expect, it, vi } from 'vitest';
import { applyServerErrors, parseServerErrors } from '../src/serverErrors.js';

const apiError = (data: unknown) => ({ isAxiosError: true, message: 'Request failed', response: { status: 400, data } });

describe('parseServerErrors', () => {
    it('maps validation details to form fields without the request part', () => {
        const error = apiError({
            code: 'VALIDATION_ERROR',
            message: 'Username is taken',
            details: [
                { path: 'body.username', message: 'Username is taken' },
                { path: 'body.username', message: 'second issue is ignored' },
                { path: 'body.profile.bio', message: 'Too long' },
            ],
        });
        expect(parseServerErrors(error)).toEqual({
            fields: { username: 'Username is taken', 'profile.bio': 'Too long' },
            message: 'Username is taken',
        });
    });

    it('falls back to the message for errors without details', () => {
        expect(parseServerErrors(apiError({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }))).toEqual({
            fields: {},
            message: 'Invalid email or password',
        });
        expect(parseServerErrors(new Error('Network Error')).message).toBe('Network Error');
    });
});

describe('applyServerErrors', () => {
    const error = apiError({
        code: 'VALIDATION_ERROR',
        message: 'Bad input',
        details: [{ path: 'body.email', message: 'Email is taken' }, { path: 'body.unknown', message: 'Not a field' }],
    });

    it('sets errors on known fields only', () => {
        const setError = vi.fn();
        applyServerErrors<{ email: string }>(setError, error, ['email']);
        expect(setError.mock.calls).toEqual([['email', { type: 'server', message: 'Email is taken' }]]);
    });

    it('puts the message on the form when no detail matches a field', () => {
        const setError = vi.fn();
        applyServerErrors<{ name: string }>(setError, error, ['name']);
        expect(setError.mock.calls).toEqual([['root.server', { type: 'server', message: 'Bad input' }]]);
    });
});
