import type { Request, Response, RequestHandler } from 'express';
import type { z } from 'zod';
import type { ErrorResponse } from '@cm/contracts';
import { AppError } from '../lib/errors';

interface RequestSchemas {
    params?: z.ZodType;
    query?: z.ZodType;
    body?: z.ZodType;
}

type Parsed<S, Fallback> = S extends z.ZodType ? z.output<S> : Fallback;

interface ValidatedInput<S extends RequestSchemas> {
    params: Parsed<S['params'], Request['params']>;
    query: Parsed<S['query'], Request['query']>;
    body: Parsed<S['body'], unknown>;
}

export function withValidation<S extends RequestSchemas>(
    schemas: S,
    handler: (input: ValidatedInput<S>, req: Request, res: Response) => unknown,
): RequestHandler {
    return async (req, res) => {
        const details: NonNullable<ErrorResponse['details']> = [];

        const parse = (part: keyof RequestSchemas, value: unknown): unknown => {
            const schema = schemas[part];
            if (!schema) return value;
            const result = schema.safeParse(value);
            if (result.success) return result.data;
            for (const issue of result.error.issues) {
                details.push({ path: [part, ...issue.path].join('.'), message: issue.message });
            }
            return undefined;
        };

        const input = {
            params: parse('params', req.params),
            query: parse('query', req.query),
            body: parse('body', req.body ?? {}),
        } as ValidatedInput<S>;

        const [first] = details;
        if (first) {
            // `message` carries the first problem so clients that only show `message` stay helpful.
            throw new AppError(400, 'VALIDATION_ERROR', first.message, details);
        }

        await handler(input, req, res);
    };
}
