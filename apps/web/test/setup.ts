import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { configureHttp } from '@cm/api-client';
import { authStore, getAccessToken, handleAuthFailure, logout, refreshAccessToken } from '@cm/auth';
import { server } from './server';

vi.mock('next/navigation', async () => (await import('./next')).navigation);
vi.mock('next/image', async () => ({ default: (await import('./next')).Image }));
vi.mock('next/link', async () => ({ default: (await import('./next')).Link }));

configureHttp({
    getBaseUrl: () => 'http://localhost/api/v1',
    getAccessToken,
    refreshAccessToken,
    onAuthFailure: handleAuthFailure,
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(async () => {
    cleanup();
    if (authStore.getState().status === 'authenticated') await logout();
    server.resetHandlers();
    vi.clearAllMocks();
});
afterAll(() => server.close());
