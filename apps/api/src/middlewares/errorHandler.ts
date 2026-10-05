import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ErrorResponse } from '@cm/contracts';
import multer from 'multer';
import { AppError } from '../lib/errors';

interface HttpError extends Error {
    status?: number;
    statusCode?: number;
    expose?: boolean;
    type?: string;
}

const httpErrorCodes: Record<string, string> = {
    'entity.parse.failed': 'INVALID_JSON',
    'entity.too.large': 'PAYLOAD_TOO_LARGE',
};

export const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).json({ code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof AppError) {
        const body: ErrorResponse = { code: err.code, message: err.message, details: err.details };
        res.status(err.status).json(body);
        return;
    }

    if (err instanceof multer.MulterError) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        res.status(status).json({ code: err.code, message: err.message });
        return;
    }

    const httpError = err as HttpError;
    const status = httpError.status ?? httpError.statusCode;
    if (status && status >= 400 && status < 500 && httpError.expose) {
        const code = (httpError.type && httpErrorCodes[httpError.type]) ?? 'BAD_REQUEST';
        res.status(status).json({ code, message: httpError.message });
        return;
    }

    req.log.error({ err }, 'Unhandled error');
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
};
