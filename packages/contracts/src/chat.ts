import { z } from 'zod';
import { DateTimeSchema } from './common';

export const MessageTypeSchema = z.enum(['text', 'image']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ChatMessageSchema = z.object({
    message_id: z.number().int(),
    from_user_id: z.number().int(),
    to_user_id: z.number().int(),
    content: z.string().nullable(),
    media_url: z.string().nullable(),
    type: MessageTypeSchema,
    created_at: DateTimeSchema,
    updated_at: DateTimeSchema,
    FromUser: z
        .object({
            user_id: z.number().int(),
            username: z.string(),
            profile_picture: z.string().nullable(),
        })
        .optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ConversationSchema = z.object({
    user_id: z.number().int(),
    username: z.string(),
    profile_picture: z.string().nullable(),
    last_message_time: DateTimeSchema.nullable(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const UploadResponseSchema = z.object({
    url: z.string(),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
