import { z } from 'zod';
import { createDocument, type ZodOpenApiOperationObject, type ZodOpenApiPathsObject } from 'zod-openapi';
import type { Endpoint } from '../endpoint';
import { endpoints } from '../endpoints';
import { ErrorResponseSchema } from '../common';

const errorResponse = (description: string) => ({
    description,
    content: { 'application/json': { schema: ErrorResponseSchema } },
});

function requestBody(endpoint: Endpoint): ZodOpenApiOperationObject['requestBody'] {
    if (endpoint.upload) {
        const { field, maxCount, optional } = endpoint.upload;
        const file = maxCount > 1 ? z.array(z.file()).max(maxCount) : z.file();
        const fields = endpoint.body instanceof z.ZodObject ? endpoint.body : z.object({});
        const schema = fields.extend({ [field]: optional ? file.optional() : file });
        return { content: { 'multipart/form-data': { schema } } };
    }
    if (endpoint.body) return { content: { 'application/json': { schema: endpoint.body } } };
    return undefined;
}

function operation(operationId: string, endpoint: Endpoint): ZodOpenApiOperationObject {
    const hasInput = Boolean(endpoint.params || endpoint.query || endpoint.body || endpoint.upload);
    const { status, schema } = endpoint.response;

    return {
        operationId,
        summary: endpoint.summary,
        tags: [endpoint.tag],
        ...(endpoint.auth && { security: [{ bearerAuth: [] }] }),
        requestParams: {
            ...(endpoint.params && { path: endpoint.params as z.ZodObject }),
            ...(endpoint.query && { query: endpoint.query as z.ZodObject }),
        },
        requestBody: requestBody(endpoint),
        responses: {
            [status]: schema
                ? { description: 'OK', content: { 'application/json': { schema } } }
                : { description: 'No content' },
            ...(hasInput && { 400: errorResponse('Invalid request') }),
            ...((endpoint.auth || endpoint.path.startsWith('/auth/')) && { 401: errorResponse('Not authenticated') }),
            ...(endpoint.errors?.includes(403) && { 403: errorResponse('Forbidden') }),
            ...(endpoint.errors?.includes(404) && { 404: errorResponse('Not found') }),
            ...(endpoint.errors?.includes(409) && { 409: errorResponse('Conflict') }),
        },
    };
}

function dropBinaryContentEncoding(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    const schema = node as Record<string, unknown>;
    if (schema.format === 'binary') delete schema.contentEncoding;
    Object.values(schema).forEach(dropBinaryContentEncoding);
}

export function createOpenApiDocument(): ReturnType<typeof createDocument> {
    const paths: ZodOpenApiPathsObject = {};
    for (const [group, groupEndpoints] of Object.entries(endpoints)) {
        for (const [name, endpoint] of Object.entries(groupEndpoints) as [string, Endpoint][]) {
            const path = endpoint.path.replace(/:(\w+)/g, '{$1}');
            const operationId = group + name.charAt(0).toUpperCase() + name.slice(1);
            paths[path] = { ...paths[path], [endpoint.method]: operation(operationId, endpoint) };
        }
    }

    const document = createDocument({
        openapi: '3.1.0',
        info: { title: 'Content Master API', version: '1.0.0' },
        servers: [{ url: '/api/v1' }],
        paths,
        components: {
            securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
        },
    });
    dropBinaryContentEncoding(document);
    return document;
}
