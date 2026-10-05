import type { Request, RequestHandler } from 'express';
import { verifyAccessToken, type AccessTokenPayload } from '../auth/tokens';
import { AppError } from '../lib/errors';

declare global {
    namespace Express {
        interface Request {
            auth?: AccessTokenPayload;
        }
    }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    req.auth = verifyAccessToken(header.slice('Bearer '.length));
    next();
};

export function currentUserId(req: Request): number {
    if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    return req.auth.userId;
}
