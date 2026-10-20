"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureHttp } from "@cm/api-client";
import { AuthProvider, authStore, getAccessToken, getFreshAccessToken, handleAuthFailure, refreshAccessToken, useAuth } from "@cm/auth";
import { publicEnv } from "@cm/env";
import { createRealtimeClient, RealtimeProvider } from "@cm/realtime";

configureHttp({
    getBaseUrl: () => publicEnv().API_URL,
    getAccessToken,
    refreshAccessToken,
    onAuthFailure: handleAuthFailure,
});

const realtime = createRealtimeClient({ url: () => publicEnv().REALTIME_URL, getToken: getFreshAccessToken });

function Realtime({ children }: { children: React.ReactNode }) {
    const { status } = useAuth();
    return <RealtimeProvider client={realtime} enabled={status === 'authenticated'}>{children}</RealtimeProvider>;
}

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
                <Realtime>{children}</Realtime>
            </AuthProvider>
        </QueryClientProvider>
    );
}
