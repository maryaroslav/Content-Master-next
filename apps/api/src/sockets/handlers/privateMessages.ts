import { Server, Socket } from 'socket.io';
import { Message } from '../../models';
import { toChatMessage } from '../../modules/chat/service';
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

    socket.on(
        'private_message',
        async (payload: { toUserId: number; message?: string; type?: 'text' | 'image'; media_url?: string | null }) => {
            try {
                const { toUserId, message = '', type = 'text', media_url = null } = payload;

                const newMessage = await Message.create({
                    from_user_id: socket.user.user_id,
                    to_user_id: toUserId,
                    content: type === 'text' ? message : '',
                    media_url: type === 'image' ? media_url : null,
                    type,
                });

                const out = toChatMessage(newMessage);

                io.to(`user_${socket.user.user_id}`).emit('private_message', out);
                io.to(`user_${toUserId}`).emit('private_message', out);
            } catch (err: unknown) {
                logger.error({ err }, '[socket.io] Failed to save message');
            }
        }
    );

    socket.on('disconnect', () => {
        logger.debug({ userId: socket.user?.user_id }, '[socket.io] Disconnected');
    });
}