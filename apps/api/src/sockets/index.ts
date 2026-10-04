import http from 'http';
import { Server, Socket } from 'socket.io';
import socketAuthMiddleware from './middlewares/socketAuthMiddleware';
import privateMessagesHandler from './handlers/privateMessages';
import { env } from '../config/env';
import { logger } from '../lib/logger';

type SocketWithUser = Socket & {
    user?: {
        user_id?: number;
        [key: string]: any;
    };
};

export default function initializeSocket(server: http.Server) {
    const io = new Server(server, {
        cors: {
            origin: env.CORS_ORIGINS,
            credentials: true,
        },
    });

    io.use((socket: SocketWithUser, next) => socketAuthMiddleware(socket, next));

    io.on('connection', (socket: SocketWithUser) => {
        logger.debug({ userId: socket.user?.user_id }, '[socket.io] Connected');
        privateMessagesHandler(io, socket as any);
    });

    return io;
}