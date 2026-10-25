import { z } from 'zod';
import type { Ack, ClientEvent, ErrorResponse } from '@cm/contracts';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { AppSocket } from './types';

type Handler<E extends ClientEvent> = (payload: z.output<E['payload']>) => Promise<z.output<E['ack']>>;

function parsePayload<E extends ClientEvent>(event: E, payload: unknown): z.output<E['payload']> {
    const result = event.payload.safeParse(payload);
    if (result.success) return result.data as z.output<E['payload']>;
    const details = result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    throw new AppError(400, 'VALIDATION_ERROR', details[0]!.message, details);
}

function toError(err: unknown, event: string): ErrorResponse {
    if (err instanceof AppError) return { code: err.code, message: err.message, details: err.details };
    logger.error({ err, event }, '[socket.io] Unhandled error');
    return { code: 'INTERNAL_ERROR', message: 'Internal server error' };
}

export function on<E extends ClientEvent>(socket: AppSocket, event: E, handler: Handler<E>): void {
    const listen = socket.on.bind(socket) as (name: string, listener: (payload: unknown, ack: unknown) => void) => void;

    listen(event.name, async (payload, ack) => {
        const reply = typeof ack === 'function' ? (ack as (result: Ack<unknown>) => void) : () => {};
        try {
            const data = await handler(parsePayload(event, payload));
            if (env.NODE_ENV !== 'production') event.ack.parse(JSON.parse(JSON.stringify(data)));
            reply({ ok: true, data });
        } catch (err) {
            reply({ ok: false, error: toError(err, event.name) });
        }
    });
}
