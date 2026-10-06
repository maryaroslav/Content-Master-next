import type { z } from 'zod';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface Endpoint {
    method: HttpMethod;
    // Relative to /api/v1, in Express syntax (`/posts/:postId`).
    path: string;
    summary: string;
    tag: string;
    auth: boolean;
    params?: z.ZodType;
    query?: z.ZodType;
    body?: z.ZodType;
    // Multipart image upload; `body` then describes the text fields.
    upload?: { field: string; maxCount: number; optional?: true };
    response: { status: 200 | 201 | 204; schema?: z.ZodType };
    errors?: (403 | 404 | 409)[];
}

export const defineEndpoint = <const E extends Endpoint>(endpoint: E): E => endpoint;

export type EndpointInput<E extends Endpoint, K extends 'params' | 'query' | 'body'> = E[K] extends z.ZodType
    ? z.output<E[K]>
    : undefined;

export type EndpointResponse<E extends Endpoint> = E['response']['schema'] extends z.ZodType
    ? z.output<E['response']['schema']>
    : void;
