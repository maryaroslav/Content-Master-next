import type { Router } from 'express';
import { chatEndpoints } from '@cm/contracts';
import { currentUserId } from '../../middlewares/requireAuth';
import { AppError } from '../../lib/errors';
import { publicUrl } from '../../storage/storage';
import { mount } from '../mount';
import * as chatService from './service';

export function mountChatRoutes(router: Router): void {
    mount(router, chatEndpoints.conversations, async (_input, req) =>
        (await chatService.listConversations(currentUserId(req))).map(({ user, lastMessageAt }) => ({
            user: { id: user.user_id, username: user.username, profilePicture: publicUrl(user.profile_picture) },
            lastMessageAt,
        }))
    );

    mount(router, chatEndpoints.messages, async ({ params, query }, req) => {
        const { messages, nextCursor } = await chatService.listMessages(currentUserId(req), params.userId, query);
        return {
            items: messages.map((message) => ({
                id: message.message_id,
                fromUserId: message.from_user_id,
                toUserId: message.to_user_id,
                content: message.content ?? null,
                mediaUrl: message.media_url ?? null,
                type: message.type,
                createdAt: message.created_at,
            })),
            nextCursor,
        };
    });

    mount(router, chatEndpoints.uploadAttachment, async (_input, req) => {
        if (!req.file) throw new AppError(400, 'VALIDATION_ERROR', 'No file uploaded');
        return { url: await chatService.saveAttachment(req.file) };
    });
}
