import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    id?: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
}

interface AuthState {
    user: AuthUser | null;
}

const loadUserFromLocalStorage = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as AuthUser;
        return null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: loadUserFromLocalStorage()
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem('currentUser', JSON.stringify(action.payload));
            }
        },
        logout: (state) => {
            state.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('currentUser');
            }
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;