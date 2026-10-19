import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getAuthLogoutMockHandler } from '@cm/api-client/mocks';
import type { ErrorResponse } from '@cm/contracts';

export const apiError = (status: number, body: ErrorResponse) => HttpResponse.json(body, { status });

export const server = setupServer(
    getAuthLogoutMockHandler(),
    http.post('*/auth/refresh', () => apiError(401, { code: 'INVALID_REFRESH_TOKEN', message: 'No session' })),
);
