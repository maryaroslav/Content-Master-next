import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { withValidation } from '../../src/middlewares/validate';
import { errorHandler } from '../../src/middlewares/errorHandler';

const app = express();
app.use(express.json());
app.post(
    '/items/:id',
    withValidation(
        {
            params: z.object({ id: z.coerce.number().int().positive() }),
            query: z.object({ verbose: z.enum(['yes', 'no']).default('no') }),
            body: z.object({ name: z.string().min(1, 'Name is required') }),
        },
        ({ params, query, body }, _req, res) => {
            res.json({ id: params.id, idType: typeof params.id, verbose: query.verbose, name: body.name });
        }
    )
);
app.use(errorHandler);

describe('withValidation', () => {
    it('passes coerced and defaulted values to the handler', async () => {
        const res = await request(app).post('/items/7').send({ name: 'x' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 7, idType: 'number', verbose: 'no', name: 'x' });
    });

    it('reports every invalid field and puts the first one in message', async () => {
        const res = await request(app).post('/items/abc?verbose=maybe').send({ name: '' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details.map((d: { path: string }) => d.path)).toEqual(['params.id', 'query.verbose', 'body.name']);
        expect(res.body.message).toBe(res.body.details[0].message);
    });

    it('treats a request without a body as an empty object', async () => {
        const res = await request(app).post('/items/1');
        expect(res.status).toBe(400);
        expect(res.body.details).toEqual([{ path: 'body.name', message: expect.any(String) }]);
    });
});
