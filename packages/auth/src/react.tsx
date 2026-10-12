import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { authStore, refreshAccessToken, type AuthState } from './session.js';

export function AuthProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // On startup the session is restored from the refresh cookie, if there is one.
        if (authStore.getState().status === 'loading') void refreshAccessToken();
    }, []);
    return children;
}

export function useAuth(): AuthState {
    return useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
}
