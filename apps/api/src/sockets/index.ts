import http from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { socketAuth } from './auth';
import { registerChatHandlers } from './handlers/chat';
import { userRoom, type AppServer } from './types';

export default function initializeSocket(server: http.Server): AppServer {
    const io: AppServer = new Server(server, {
        cors: {
            origin: env.CORS_ORIGINS,
            credentials: true,
        },
    });

    io.use(socketAuth);

    io.on('connection', (socket) => {
        const { userId, tokenExpiresAt } = socket.data;
        logger.debug({ userId }, '[socket.io] Connected');
        void socket.join(userRoom(userId));
        registerChatHandlers(socket);

        const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, tokenExpiresAt - Date.now()));
        socket.on('disconnect', () => {
            clearTimeout(expiry);
            logger.debug({ userId }, '[socket.io] Disconnected');
        });
    });

    return io;
}
