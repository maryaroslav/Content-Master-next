import { z } from 'zod';
import { DateTimeSchema, paginated } from './common';

export const MessageTypeSchema = z.enum(['text', 'image']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ChatMessageSchema = z.object({
    id: z.number().int(),
    fromUserId: z.number().int(),
    toUserId: z.number().int(),
    content: z.string().nullable(),
    mediaUrl: z.string().nullable(),
    type: MessageTypeSchema,
    createdAt: DateTimeSchema,
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Each page is in chronological order; `nextCursor` points to older messages.
export const ChatMessagePageSchema = paginated(ChatMessageSchema);
export type ChatMessagePage = z.infer<typeof ChatMessagePageSchema>;

export const ConversationSchema = z.object({
    user: z.object({
        id: z.number().int(),
        username: z.string(),
        profilePicture: z.string().nullable(),
    }),
    lastMessageAt: DateTimeSchema.nullable(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const AttachmentResponseSchema = z.object({
    url: z.string(),
});
export type AttachmentResponse = z.infer<typeof AttachmentResponseSchema>;
