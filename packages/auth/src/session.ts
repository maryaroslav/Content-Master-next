import {
    authLogin,
    authLogout,
    authRefresh,
    authRegister,
    authTwoFactorLogin,
    type AuthSession,
    type LoginRequest,
    type RegisterRequest,
    type TwoFactorLoginRequest,
    type User,
} from '@cm/api-client';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
    status: AuthStatus;
    user: User | null;
}

export type LoginResult = { status: 'authenticated' } | { status: 'twoFactorRequired'; challengeToken: string };

let state: AuthState = { status: 'loading', user: null };
// Kept out of the state object (and out of storage) so it is never rendered or persisted.
let accessToken: string | null = null;
const listeners = new Set<() => void>();

function setState(next: AuthState): void {
    state = next;
    listeners.forEach((listener) => listener());
}

export const authStore = {
    getState: (): AuthState => state,
    subscribe(listener: () => void): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

export const getAccessToken = (): string | null => accessToken;

function applySession(session: AuthSession): void {
    accessToken = session.accessToken;
    setState({ status: 'authenticated', user: session.user });
}

function clearSession(): void {
    accessToken = null;
    setState({ status: 'unauthenticated', user: null });
}

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cm-auth') : null;
channel?.addEventListener('message', (event: MessageEvent) => {
    if (event.data === 'logout') clearSession();
    if (event.data === 'login' && state.status !== 'authenticated') void refreshAccessToken();
});

// The refresh token rotates and reusing an old one revokes the whole session, so tabs sharing the
// cookie must not refresh at the same time: the lock makes each tab use the cookie the previous one got.
async function withRefreshLock<T>(refresh: () => Promise<T>): Promise<T> {
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    return locks ? await locks.request('cm-auth-refresh', refresh) : refresh();
}

// Only the server's logout response can delete the httpOnly refresh cookie. When that request fails,
// this flag (shared by the tabs) stops the cookie from restoring the session until a logout gets through.
const PENDING_LOGOUT = 'cm-auth-logout-pending';

function setLogoutPending(pending: boolean): void {
    try {
        if (pending) localStorage.setItem(PENDING_LOGOUT, '1');
        else localStorage.removeItem(PENDING_LOGOUT);
    } catch {
        // No storage (private mode, server): the flag cannot outlive this page.
    }
}

function isLogoutPending(): boolean {
    try {
        return localStorage.getItem(PENDING_LOGOUT) === '1';
    } catch {
        return false;
    }
}

async function sendLogout(): Promise<void> {
    try {
        await authLogout();
        setLogoutPending(false);
    } catch {
        setLogoutPending(true);
    }
}

let refreshing: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
    refreshing ??= withRefreshLock(async () => {
        if (isLogoutPending()) {
            await sendLogout();
            clearSession();
            return null;
        }
        try {
            const session = await authRefresh();
            applySession(session);
            return session.accessToken;
        } catch {
            clearSession();
            return null;
        }
    }).finally(() => {
        refreshing = null;
    });
    return refreshing;
}


// Reading `exp` needs no signature check: the token is only used to decide when to refresh it.
function expiresAt(token: string): number {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
        return (payload.exp ?? 0) * 1000;
    } catch {
        return 0;
    }
}

// For callers that send the token without the api-client's retry-on-401 (raw fetch, Socket.IO handshake).
export async function getFreshAccessToken(): Promise<string | null> {
    if (accessToken && expiresAt(accessToken) - Date.now() > 30_000) return accessToken;
    return refreshAccessToken();
}

// A login replaces the refresh cookie, so an unfinished logout no longer matters.
function startSession(session: AuthSession): void {
    setLogoutPending(false);
    applySession(session);
}

export async function login(credentials: LoginRequest): Promise<LoginResult> {
    const result = await authLogin(credentials);
    if ('twoFactorRequired' in result) return { status: 'twoFactorRequired', challengeToken: result.challengeToken };

    startSession(result);
    channel?.postMessage('login');
    return { status: 'authenticated' };
}

export async function loginWithTwoFactor(input: TwoFactorLoginRequest): Promise<void> {
    startSession(await authTwoFactorLogin(input));
    channel?.postMessage('login');
}

export async function register(input: RegisterRequest): Promise<LoginResult> {
    await authRegister(input);
    return login({ email: input.email, password: input.password });
}

// Never rejects: the local session ends and the other tabs are told even when the request fails.
export async function logout(): Promise<void> {
    await sendLogout();
    clearSession();
    channel?.postMessage('logout');
}

export function updateUser(user: User): void {
    if (state.status === 'authenticated') setState({ status: 'authenticated', user });
}

export const handleAuthFailure = clearSession;
