import { clientEvents } from '@cm/contracts';
import { sendMessage, toChatMessage } from '../../modules/chat/service';
import { on } from '../on';
import { userRoom, type AppSocket } from '../types';

export function registerChatHandlers(socket: AppSocket): void {
    on(socket, clientEvents.sendMessage, async (payload) => {
        const message = toChatMessage(await sendMessage(socket.data.userId, payload));
        socket.to([userRoom(message.fromUserId), userRoom(message.toUserId)]).emit('message:new', message);
        return message;
    });
}
