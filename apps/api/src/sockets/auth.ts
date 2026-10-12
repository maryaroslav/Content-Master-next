import type { ExtendedError } from 'socket.io';
import { verifyAccessToken } from '../auth/tokens';
import { logger } from '../lib/logger';
import type { AppSocket } from './types';

export function socketAuth(socket: AppSocket, next: (err?: ExtendedError) => void): void {
    const token: unknown = socket.handshake.auth?.token;
    if (typeof token !== 'string' || !token) {
        next(new Error('No token provided'));
        return;
    }

    try {
        const { userId, expiresAt } = verifyAccessToken(token.replace(/^Bearer /, ''));
        socket.data.userId = userId;
        socket.data.tokenExpiresAt = expiresAt;
        next();
    } catch (err) {
        logger.debug({ err }, '[socket.io] Invalid token');
        next(new Error('Invalid token'));
    }
}
