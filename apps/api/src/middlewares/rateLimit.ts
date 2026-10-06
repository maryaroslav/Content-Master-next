import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
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
    // Refreshing and logging out happen on every page load / session end and guess nothing.
    skip: (req) => env.NODE_ENV === 'test' || req.path === '/refresh' || req.path === '/logout',
});

// Keyed by challenge: 5 code attempts per challenge, and a new challenge requires the password again.
export const twoFactorLoginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: (req) =>
        typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : ipKeyGenerator(req.ip ?? ''),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, please log in again.' },
    skip: () => env.NODE_ENV === 'test',
});
