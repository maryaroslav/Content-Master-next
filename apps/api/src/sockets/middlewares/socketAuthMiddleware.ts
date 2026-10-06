import { Socket } from "socket.io";
import { verifyAccessToken } from "../../auth/tokens";
import { logger } from '../../lib/logger';

type AuthUser = {
    user_id?: number;
    email?: string;
};

type SocketWithUser = Socket & { user?: AuthUser };

const socketAuthMiddleware = (socket: SocketWithUser, next: (err?: Error) => void) => {
    const tokenRaw: unknown = socket.handshake.auth?.token;
    if (typeof tokenRaw !== 'string' || !tokenRaw) {
        return next(new Error('No token provided'));
    }

    try {
        const { userId, email } = verifyAccessToken(tokenRaw.replace(/^Bearer /, ''));
        socket.user = { user_id: userId, email };
        next();
    } catch (err) {
        logger.debug({ err }, '[socket.io] Invalid token');
        next(new Error('Invalid token'));
    }
};

export default socketAuthMiddleware;
