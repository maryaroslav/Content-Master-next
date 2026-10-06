import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export interface HttpConfig {
    getBaseUrl: () => string;
    getAccessToken: () => string | null;
    refreshAccessToken: () => Promise<string | null>;
    onAuthFailure: () => void;
}

let config: HttpConfig | null = null;

export function configureHttp(next: HttpConfig): void {
    config = next;
}

function requireConfig(): HttpConfig {
    if (!config) throw new Error('@cm/api-client: call configureHttp() before making requests');
    return config;
}

export const http = axios.create({ withCredentials: true });

http.interceptors.request.use((request) => {
    const { getBaseUrl, getAccessToken } = requireConfig();
    request.baseURL = getBaseUrl();
    const token = getAccessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
});

let refreshing: Promise<string | null> | null = null;

http.interceptors.response.use(undefined, async (error: unknown) => {
    const request = error instanceof AxiosError ? (error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined) : undefined;
    const isAuthRoute = request?.url?.startsWith('/auth/');
    if (!(error instanceof AxiosError) || error.response?.status !== 401 || !request || request._retried || isAuthRoute) {
        throw error;
    }

    const { refreshAccessToken, onAuthFailure } = requireConfig();
    refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
    });
    const token = await refreshing;
    if (!token) {
        onAuthFailure();
        throw error;
    }

    request._retried = true;
    return http(request);
});
