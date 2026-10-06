import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureHttp, http } from '../src/http/instance';

const seen: { url?: string; authorization?: string }[] = [];
let validToken = 'fresh-token';

const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const authorization = config.headers.get('Authorization') as string | undefined;
    seen.push({ url: config.url, authorization });
    const response = { config, headers: new AxiosHeaders(), statusText: '', request: {} };
    if (authorization === `Bearer ${validToken}`) return { ...response, status: 200, data: { ok: true } };
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, {}, { ...response, status: 401, data: {} });
};
http.defaults.adapter = adapter;

let accessToken: string | null;
const refreshAccessToken = vi.fn();
const onAuthFailure = vi.fn();

beforeEach(() => {
    seen.length = 0;
    validToken = 'fresh-token';
    accessToken = 'fresh-token';
    refreshAccessToken.mockReset();
    onAuthFailure.mockReset();
    configureHttp({
        getBaseUrl: () => '/api/v1',
        getAccessToken: () => accessToken,
        refreshAccessToken,
        onAuthFailure,
    });
});

describe('http instance', () => {
    it('sends the base URL and the access token', async () => {
        const res = await http.get('/users/me');
        expect(res.config.baseURL).toBe('/api/v1');
        expect(seen).toEqual([{ url: '/users/me', authorization: 'Bearer fresh-token' }]);
    });

    it('refreshes once on 401 and retries with the new token', async () => {
        accessToken = 'expired';
        refreshAccessToken.mockImplementation(async () => (accessToken = 'fresh-token'));

        await expect(http.get('/users/me')).resolves.toMatchObject({ data: { ok: true } });
        expect(refreshAccessToken).toHaveBeenCalledTimes(1);
        expect(seen.map((r) => r.authorization)).toEqual(['Bearer expired', 'Bearer fresh-token']);
    });

    it('shares one refresh between concurrent requests', async () => {
        accessToken = 'expired';
        refreshAccessToken.mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return (accessToken = 'fresh-token');
        });

        await Promise.all([http.get('/a'), http.get('/b'), http.get('/c')]);
        expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    it('gives up and reports when the refresh fails', async () => {
        accessToken = 'expired';
        refreshAccessToken.mockResolvedValue(null);

        await expect(http.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });
        expect(onAuthFailure).toHaveBeenCalledTimes(1);
    });

    it('does not refresh for auth routes', async () => {
        accessToken = null;
        await expect(http.post('/auth/login')).rejects.toMatchObject({ response: { status: 401 } });
        expect(refreshAccessToken).not.toHaveBeenCalled();
    });

    it('retries a request only once', async () => {
        accessToken = 'expired';
        validToken = 'never-valid';
        refreshAccessToken.mockResolvedValue('still-wrong');

        await expect(http.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });
        expect(refreshAccessToken).toHaveBeenCalledTimes(1);
        expect(seen).toHaveLength(2);
    });
});
