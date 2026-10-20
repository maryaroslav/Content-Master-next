import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import type { ErrorResponse } from '@cm/contracts';
import { useDateText } from '@/i18n/useDateText';
import { useErrorText } from '@/i18n/useErrorText';
import { renderHookWithProviders } from './render';

const apiFailure = (status: number, data: ErrorResponse) =>
    new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
        status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }, data,
    });

describe('useErrorText', () => {
    it('prefers the scoped field message, then the general one, then the contract text', () => {
        const scoped = renderHookWithProviders(() => useErrorText('login')).result.current;
        const general = renderHookWithProviders(() => useErrorText()).result.current;

        expect(scoped.field({ type: 'too_small', message: 'x' }, 'password')).toBe('Password is required');
        expect(general.field({ type: 'too_small', message: 'x' }, 'password')).toBe('Password must be at least 8 characters long');
        expect(general.field({ type: 'custom', message: 'From the contract' }, 'password')).toBe('From the contract');
    });

    it('translates API errors by code and falls back to the API message', () => {
        const { result } = renderHookWithProviders(() => useErrorText(), { locale: 'cs' });

        expect(result.current.request(apiFailure(401, { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }))).toBe('Nesprávný e-mail nebo heslo');
        expect(result.current.request(apiFailure(418, { code: 'NEW_CODE', message: 'Server text' }))).toBe('Server text');
    });
});

describe('useDateText', () => {
    const now = new Date('2026-10-12T12:00:00Z');

    it('labels chat days in the Prague time zone', () => {
        const { result } = renderHookWithProviders(() => useDateText(), { now });
        const { dayLabel } = result.current;

        expect(dayLabel('2026-10-11T23:30:00Z')).toBe('Today');
        expect(dayLabel('2026-10-11T12:00:00Z')).toBe('Yesterday');
        expect(dayLabel('2026-10-06T12:00:00Z')).toBe('October 6');
        expect(dayLabel('2025-10-06T12:00:00Z')).toBe('October 6, 2025');
    });

    it('is relative under a week and a date after that', () => {
        const { result } = renderHookWithProviders(() => useDateText(), { now, locale: 'cs' });

        expect(result.current.relative('2026-10-12T09:00:00Z')).toBe('před 3 hodinami');
        expect(result.current.relative('2026-10-01T09:00:00Z')).toBe('1. 10. 2026');
    });
});
