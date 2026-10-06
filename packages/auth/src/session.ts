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

let refreshing: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
    refreshing ??= withRefreshLock(async () => {
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


export async function login(credentials: LoginRequest): Promise<LoginResult> {
    const result = await authLogin(credentials);
    if ('twoFactorRequired' in result) return { status: 'twoFactorRequired', challengeToken: result.challengeToken };

    applySession(result);
    channel?.postMessage('login');
    return { status: 'authenticated' };
}

export async function loginWithTwoFactor(input: TwoFactorLoginRequest): Promise<void> {
    applySession(await authTwoFactorLogin(input));
    channel?.postMessage('login');
}

export async function register(input: RegisterRequest): Promise<LoginResult> {
    await authRegister(input);
    return login({ email: input.email, password: input.password });
}

export async function logout(): Promise<void> {
    try {
        await authLogout();
    } finally {
        clearSession();
        channel?.postMessage('logout');
    }
}

export function updateUser(user: User): void {
    if (state.status === 'authenticated') setState({ status: 'authenticated', user });
}

export const handleAuthFailure = clearSession;
