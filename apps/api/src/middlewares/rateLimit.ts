import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env';

const tooManyRequests = { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' };

export const apiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: tooManyRequests,
    skip: () => env.NODE_ENV === 'test',
});

export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: tooManyRequests,
    skip: () => env.NODE_ENV === 'test',
});
