import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '@cm/api-client';

vi.mock('@cm/api-client', () => ({
    authLogin: vi.fn(),
    authLogout: vi.fn(),
    authRefresh: vi.fn(),
    authRegister: vi.fn(),
    authTwoFactorLogin: vi.fn(),
}));

const mocked = vi.mocked(api);

const user = {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    fullName: null,
    bio: null,
    profilePicture: null,
    role: 'user',
    twoFactorEnabled: false,
    createdAt: '2026-10-01T00:00:00.000Z',
};
const session = (accessToken: string) => ({ accessToken, user });

// Stands in for the other tabs: records what this tab sends and can deliver messages to it.
class FakeChannel {
    static instances: FakeChannel[] = [];
    posted: unknown[] = [];
    private listener?: (event: { data: unknown }) => void;
    constructor() {
        FakeChannel.instances.push(this);
    }
    addEventListener(_type: string, listener: (event: { data: unknown }) => void) {
        this.listener = listener;
    }
    postMessage(data: unknown) {
        this.posted.push(data);
    }
    receive(data: unknown) {
        this.listener?.({ data });
    }
}

const lockRequests: string[] = [];

async function loadSession() {
    vi.resetModules();
    FakeChannel.instances = [];
    return import('../src/session.js');
}

beforeEach(() => {
    vi.resetAllMocks();
    lockRequests.length = 0;
    vi.stubGlobal('BroadcastChannel', FakeChannel);
    vi.stubGlobal('navigator', {
        locks: {
            request: (name: string, callback: () => Promise<unknown>) => {
                lockRequests.push(name);
                return callback();
            },
        },
    });
});

afterEach(() => vi.unstubAllGlobals());

const otherTabs = () => FakeChannel.instances[0]!;

describe('session restore and refresh', () => {
    it('restores the session from the refresh cookie', async () => {
        const auth = await loadSession();
        mocked.authRefresh.mockResolvedValue(session('token-1'));

        expect(auth.authStore.getState().status).toBe('loading');
        await expect(auth.refreshAccessToken()).resolves.toBe('token-1');
        expect(auth.authStore.getState()).toEqual({ status: 'authenticated', user });
        expect(auth.getAccessToken()).toBe('token-1');
    });

    it('ends up logged out when there is no valid session', async () => {
        const auth = await loadSession();
        mocked.authRefresh.mockRejectedValue(new Error('401'));

        await expect(auth.refreshAccessToken()).resolves.toBeNull();
        expect(auth.authStore.getState()).toEqual({ status: 'unauthenticated', user: null });
        expect(auth.getAccessToken()).toBeNull();
    });

    it('shares one refresh between concurrent callers and takes the cross-tab lock', async () => {
        const auth = await loadSession();
        mocked.authRefresh.mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            return session('token-2');
        });

        const results = await Promise.all([auth.refreshAccessToken(), auth.refreshAccessToken(), auth.refreshAccessToken()]);
        expect(results).toEqual(['token-2', 'token-2', 'token-2']);
        expect(mocked.authRefresh).toHaveBeenCalledTimes(1);
        expect(lockRequests).toEqual(['cm-auth-refresh']);
    });

    it('notifies subscribers about changes', async () => {
        const auth = await loadSession();
        const listener = vi.fn();
        auth.authStore.subscribe(listener);
        mocked.authRefresh.mockResolvedValue(session('token-1'));

        await auth.refreshAccessToken();
        expect(listener).toHaveBeenCalled();
    });
});

describe('login', () => {
    it('logs in and tells the other tabs', async () => {
        const auth = await loadSession();
        mocked.authLogin.mockResolvedValue(session('token-1'));

        await expect(auth.login({ email: 'alice@example.com', password: 'password123' })).resolves.toEqual({ status: 'authenticated' });
        expect(auth.authStore.getState().status).toBe('authenticated');
        expect(auth.getAccessToken()).toBe('token-1');
        expect(otherTabs().posted).toEqual(['login']);
    });

    it('returns the 2FA challenge without starting a session, then finishes with the code', async () => {
        const auth = await loadSession();
        mocked.authLogin.mockResolvedValue({ twoFactorRequired: true, challengeToken: 'challenge' });
        mocked.authTwoFactorLogin.mockResolvedValue(session('token-1'));

        await expect(auth.login({ email: 'alice@example.com', password: 'password123' })).resolves.toEqual({
            status: 'twoFactorRequired',
            challengeToken: 'challenge',
        });
        expect(auth.getAccessToken()).toBeNull();

        await auth.loginWithTwoFactor({ challengeToken: 'challenge', code: '123456' });
        expect(mocked.authTwoFactorLogin).toHaveBeenCalledWith({ challengeToken: 'challenge', code: '123456' });
        expect(auth.authStore.getState().status).toBe('authenticated');
    });

    it('registers and then logs in with the same credentials', async () => {
        const auth = await loadSession();
        mocked.authRegister.mockResolvedValue(user);
        mocked.authLogin.mockResolvedValue(session('token-1'));

        await auth.register({ email: 'alice@example.com', password: 'password123', username: 'alice' });
        expect(mocked.authLogin).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'password123' });
        expect(auth.authStore.getState().status).toBe('authenticated');
    });

    it('leaves the state untouched when the credentials are wrong', async () => {
        const auth = await loadSession();
        mocked.authLogin.mockRejectedValue(new Error('401'));

        await expect(auth.login({ email: 'alice@example.com', password: 'wrong' })).rejects.toThrow('401');
        expect(auth.authStore.getState().status).toBe('loading');
    });
});

describe('logout', () => {
    it('clears the session and tells the other tabs, even if the request fails', async () => {
        const auth = await loadSession();
        mocked.authLogin.mockResolvedValue(session('token-1'));
        mocked.authLogout.mockRejectedValue(new Error('offline'));
        await auth.login({ email: 'alice@example.com', password: 'password123' });

        await expect(auth.logout()).rejects.toThrow('offline');
        expect(auth.authStore.getState()).toEqual({ status: 'unauthenticated', user: null });
        expect(auth.getAccessToken()).toBeNull();
        expect(otherTabs().posted).toEqual(['login', 'logout']);
    });

    it('follows a logout in another tab', async () => {
        const auth = await loadSession();
        mocked.authLogin.mockResolvedValue(session('token-1'));
        await auth.login({ email: 'alice@example.com', password: 'password123' });

        otherTabs().receive('logout');
        expect(auth.authStore.getState().status).toBe('unauthenticated');
        expect(auth.getAccessToken()).toBeNull();
    });

    it('picks up a login from another tab', async () => {
        const auth = await loadSession();
        mocked.authRefresh.mockResolvedValue(session('token-from-cookie'));

        otherTabs().receive('login');
        await vi.waitFor(() => expect(auth.authStore.getState().status).toBe('authenticated'));
        expect(auth.getAccessToken()).toBe('token-from-cookie');
    });
});

describe('updateUser', () => {
    it('replaces the user of an active session only', async () => {
        const auth = await loadSession();
        auth.updateUser({ ...user, bio: 'ignored' });
        expect(auth.authStore.getState().user).toBeNull();

        mocked.authLogin.mockResolvedValue(session('token-1'));
        await auth.login({ email: 'alice@example.com', password: 'password123' });
        auth.updateUser({ ...user, bio: 'Hello' });
        expect(auth.authStore.getState().user?.bio).toBe('Hello');
    });
});

describe('getFreshAccessToken', () => {
    const tokenExpiringIn = (seconds: number) =>
        `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds }))}.signature`;

    it('returns the current token while it is valid for more than 30 seconds', async () => {
        const auth = await loadSession();
        const token = tokenExpiringIn(600);
        mocked.authLogin.mockResolvedValue(session(token));
        await auth.login({ email: 'alice@example.com', password: 'password123' });

        await expect(auth.getFreshAccessToken()).resolves.toBe(token);
        expect(mocked.authRefresh).not.toHaveBeenCalled();
    });

    it('refreshes a token that is about to expire', async () => {
        const auth = await loadSession();
        mocked.authLogin.mockResolvedValue(session(tokenExpiringIn(10)));
        mocked.authRefresh.mockResolvedValue(session('renewed'));
        await auth.login({ email: 'alice@example.com', password: 'password123' });

        await expect(auth.getFreshAccessToken()).resolves.toBe('renewed');
    });

    it('refreshes when there is no token yet', async () => {
        const auth = await loadSession();
        mocked.authRefresh.mockResolvedValue(session('from-cookie'));
        await expect(auth.getFreshAccessToken()).resolves.toBe('from-cookie');
    });
});
