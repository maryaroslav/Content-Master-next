import { Server, Socket } from 'socket.io';
import db from '../../models';

const { Message, User } = db as any;

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

                const fromUser = await User.findByPk(socket.user.user_id);

                const out = {
                    from_user_id: socket.user.user_id,
                    to_user_id: toUserId,
                    content: type === 'text' ? message : '',
                    media_url: type === 'image' ? media_url : null,
                    type,
                    created_at: newMessage.created_at,
                    FromUser: {
                        username: fromUser?.username ?? 'Undefined',
                        profile_picture: fromUser?.profile_picture ?? null,
                    },
                };

                io.to(`user_${socket.user.user_id}`).emit('private_message', out);
                io.to(`user_${toUserId}`).emit('private_message', out);
            } catch (err: unknown) {
                console.error('[socket.io] Failed to save message:', (err as Error)?.message ?? String(err));
            }
        }
    );

    socket.on('disconnect', () => {
        console.log(`User ${socket.user?.user_id ?? 'unknown'} disconnect`);
    });
}