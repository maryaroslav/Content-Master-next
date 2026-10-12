import { Server, Socket } from 'socket.io';
import { sendMessage, toChatMessage } from '../../modules/chat/service';
import { logger } from '../../lib/logger';

interface AuthUser {
    user_id: number;
    username?: string;
    profile_picture?: string | null;
    email?: string;
}

interface AuthenticatedSocket extends Socket {
    user: AuthUser;
}

export default function privateMessagesHandler(io: Server, socket: AuthenticatedSocket) {
    socket.join(`user_${socket.user.user_id}`);

    socket.on('private_message', async (payload: { toUserId: number; text?: string; attachmentIds?: number[] }) => {
        try {
            const message = toChatMessage(await sendMessage(socket.user.user_id, payload));
            io.to(`user_${socket.user.user_id}`).emit('private_message', message);
            io.to(`user_${message.toUserId}`).emit('private_message', message);
        } catch (err: unknown) {
            logger.error({ err }, '[socket.io] Failed to save message');
        }
    });

    socket.on('disconnect', () => {
        logger.debug({ userId: socket.user?.user_id }, '[socket.io] Disconnected');
    });
}