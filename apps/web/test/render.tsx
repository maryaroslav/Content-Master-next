import type { ReactElement, ReactNode } from 'react';
import { render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import type { User } from '@cm/api-client';
import { getAuthLoginMockHandler } from '@cm/api-client/mocks';
import { AuthProvider, login } from '@cm/auth';
import { RealtimeProvider, type RealtimeClient } from '@cm/realtime';
import { UiProvider } from '@cm/ui';
import { formats, timeZone } from '@/i18n/formats';
import cs from '../messages/cs.json';
import en from '../messages/en.json';
import { me } from './fixtures';
import { server } from './server';

const messages = { en, cs };

export function createTestRealtime() {
    const handlers = new Map<string, Set<(payload: unknown) => void>>();
    const emit = vi.fn<RealtimeClient['emit']>(async () => ({ ok: false, error: { code: 'NOT_CONNECTED', message: 'Not connected' } }));
    const client: RealtimeClient = {
        connect: () => {},
        disconnect: () => {},
        isConnected: () => true,
        subscribe: () => () => {},
        emit,
        on: (name, handler) => {
            const set = handlers.get(name) ?? new Set();
            set.add(handler as (payload: unknown) => void);
            handlers.set(name, set);
            return () => set.delete(handler as (payload: unknown) => void);
        },
    };
    const deliver = (name: string, payload: unknown) => handlers.get(name)?.forEach((handler) => handler(payload));
    return { client, emit, deliver };
}

interface Options {
    locale?: keyof typeof messages;
    now?: Date;
    realtime?: RealtimeClient;
}

function providers({ locale = 'en', now, realtime = createTestRealtime().client }: Options = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <UiProvider linkComponent={Link}>
            <QueryClientProvider client={queryClient}>
                <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone={timeZone} formats={formats} now={now}>
                    <AuthProvider>
                        <RealtimeProvider client={realtime} enabled>{children}</RealtimeProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </QueryClientProvider>
        </UiProvider>
    );
    return { queryClient, wrapper };
}

export function renderWithProviders(ui: ReactElement, options?: Options) {
    const { queryClient, wrapper } = providers(options);
    return { ...render(ui, { wrapper }), queryClient, user: userEvent.setup() };
}

export function renderHookWithProviders<T>(hook: () => T, options?: Options) {
    const { queryClient, wrapper } = providers(options);
    return { ...renderHook(hook, { wrapper }), queryClient };
}

export async function signIn(user: User = me): Promise<void> {
    server.use(getAuthLoginMockHandler({ accessToken: 'test-token', user }));
    await login({ email: user.email, password: 'password123' });
}
