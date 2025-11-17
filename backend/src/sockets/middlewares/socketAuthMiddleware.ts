import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";

type AuthUser = {
    user_id?: number;
    email?: string;
};

type SocketWithUser = Socket & { user?: AuthUser };

const socketAuthMiddleware = (socket: SocketWithUser, next: (err?: Error) => void) => {
    const tokenRaw = (socket.handshake as any)?.auth?.token;
    console.log('[socket.io] RAW token:', tokenRaw);

    if (!tokenRaw) {
        return next(new Error('No token provided'));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('[socket.io] JWT_SECRET is not defined');
        return next(new Error('Server configuration error'));
    }

    try {
        const pureToken = typeof tokenRaw === 'string' && tokenRaw.startsWith('Bearer ')
            ? tokenRaw.split(' ')[1]
            : tokenRaw as string;

        const decoded = jwt.verify(pureToken, secret) as JwtPayload | string;
        console.log('[socket.io] decoded:', decoded);

        const decodedObj = typeof decoded === 'string' ? tryParseJwtString(decoded) : decoded as JwtPayload;

        socket.user = {
            user_id: Number((decodedObj as any).id ?? (decodedObj as any).user_id) || undefined,
            email: (decodedObj as any).email,
        };

        next();
    } catch (err: any) {
        console.error('[socket.io] verify error:', err?.message ?? err);
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