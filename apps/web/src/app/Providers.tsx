"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { isAxiosError } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureHttp } from "@cm/api-client";
import { AuthProvider, authStore, getAccessToken, handleAuthFailure, refreshAccessToken } from "@cm/auth";
import { publicEnv } from "@cm/env";
import store from './lib/store';

configureHttp({
    getBaseUrl: () => publicEnv().API_URL,
    getAccessToken,
    refreshAccessToken,
    onAuthFailure: handleAuthFailure,
});

// A 4xx answer will not change on retry; only network and server errors are retried.
const shouldRetry = (failureCount: number, error: unknown) =>
    failureCount < 2 && !(isAxiosError(error) && error.response && error.response.status < 500);

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 30_000, retry: shouldRetry },
                    mutations: { retry: false },
                },
            })
    );

    useEffect(
        () => authStore.subscribe(() => {
            if (authStore.getState().status === 'unauthenticated') queryClient.clear();
        }),
        [queryClient]
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Provider store={store}>
                    {children}
                </Provider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
