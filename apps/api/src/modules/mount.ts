import type { Request, RequestHandler, Response, Router } from 'express';
import { z } from 'zod';
import type { Endpoint, EndpointInput, EndpointResponse } from '@cm/contracts';
import { env } from '../config/env';
import { requireAuth } from '../middlewares/requireAuth';
import { imageUpload } from '../middlewares/upload';
import { withValidation } from '../middlewares/validate';

// Dates may be returned as Date objects: JSON serialization turns them into the ISO strings the contract describes.
type Wire<T> = T extends string
    ? string | Date
    : T extends (infer U)[]
      ? Wire<U>[]
      : T extends object
        ? { [K in keyof T]: Wire<T[K]> }
        : T;

interface Input<E extends Endpoint> {
    params: EndpointInput<E, 'params'>;
    query: EndpointInput<E, 'query'>;
    body: EndpointInput<E, 'body'>;
}

type Handler<E extends Endpoint> = (input: Input<E>, req: Request, res: Response) => Promise<Wire<EndpointResponse<E>>>;

function assertMatchesContract(endpoint: Endpoint, schema: z.ZodType, body: unknown): void {
    const result = schema.safeParse(JSON.parse(JSON.stringify(body)));
    if (!result.success) {
        throw new Error(
            `Response of ${endpoint.method.toUpperCase()} ${endpoint.path} does not match its contract:\n${z.prettifyError(result.error)}`
        );
    }
}

export function mount<E extends Endpoint>(router: Router, endpoint: E, handler: Handler<E>, options: { before?: RequestHandler[] } = {}): void {
    const middlewares: RequestHandler[] = [];
    if (endpoint.auth) middlewares.push(requireAuth);
    middlewares.push(...(options.before ?? []));
    if (endpoint.upload) {
        const { field, maxCount } = endpoint.upload;
        middlewares.push(maxCount > 1 ? imageUpload.array(field, maxCount) : imageUpload.single(field));
    }

    middlewares.push(
        withValidation({ params: endpoint.params, query: endpoint.query, body: endpoint.body }, async (input, req, res) => {
            const result = await handler(input as Input<E>, req, res);
            const { status, schema } = endpoint.response;
            if (!schema) {
                res.status(status).end();
                return;
            }
            // Catches handlers drifting from the contract in development and tests, not at production cost.
            if (env.NODE_ENV !== 'production') assertMatchesContract(endpoint, schema, result);
            res.status(status).json(result);
        })
    );

    router[endpoint.method](endpoint.path, ...middlewares);
}
