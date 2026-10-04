import http from 'http';
import { Server, Socket } from 'socket.io';
import socketAuthMiddleware from './middlewares/socketAuthMiddleware';
import privateMessagesHandler from './handlers/privateMessages';

type SocketWithUser = Socket & {
    user?: {
        user_id?: number;
        [key: string]: any;
    };
};

export default function initializeSocket(server: http.Server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
    });

    io.use((socket: SocketWithUser, next) => socketAuthMiddleware(socket, next));

    io.on('connection', (socket: SocketWithUser) => {
        console.log(`Socket connected: ${socket.user?.user_id ?? 'unknown'}`);
        privateMessagesHandler(io, socket as any);
    });

    return io;
}