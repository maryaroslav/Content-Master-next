import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { logger } from '../../lib/logger';

type AuthUser = {
    user_id?: number;
    email?: string;
};

type SocketWithUser = Socket & { user?: AuthUser };

const socketAuthMiddleware = (socket: SocketWithUser, next: (err?: Error) => void) => {
    const tokenRaw = (socket.handshake as any)?.auth?.token;
    if (!tokenRaw) {
        return next(new Error('No token provided'));
    }

    try {
        const pureToken = typeof tokenRaw === 'string' && tokenRaw.startsWith('Bearer ')
            ? tokenRaw.split(' ')[1]
            : tokenRaw as string;

        const decoded = jwt.verify(pureToken, env.JWT_SECRET) as JwtPayload | string;
        const decodedObj = typeof decoded === 'string' ? tryParseJwtString(decoded) : decoded as JwtPayload;

        socket.user = {
            user_id: Number((decodedObj as any).id ?? (decodedObj as any).user_id) || undefined,
            email: (decodedObj as any).email,
        };

        next();
    } catch (err: any) {
        logger.debug({ err }, '[socket.io] Invalid token');
        next(new Error('Invalid token'));
    }
};

function tryParseJwtString(s: string): JwtPayload {
    try {
        return JSON.parse(s) as JwtPayload;
    } catch {
        return {} as JwtPayload;
    }
}

export default socketAuthMiddleware;