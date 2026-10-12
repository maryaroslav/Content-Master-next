import { z } from 'zod';
import { DateTimeSchema, paginated } from './common';

export const MessageTypeSchema = z.enum(['text', 'image']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const AttachmentSchema = z.object({
    id: z.number().int(),
    url: z.string(),
    mimeType: z.string(),
    size: z.number().int().nullable(),
    width: z.number().int().nullable(),
    height: z.number().int().nullable(),
}).meta({ id: 'Attachment' });
export type Attachment = z.infer<typeof AttachmentSchema>;

export const ChatMessageSchema = z.object({
    id: z.number().int(),
    fromUserId: z.number().int(),
    toUserId: z.number().int(),
    content: z.string().nullable(),
    attachments: z.array(AttachmentSchema),
    type: MessageTypeSchema,
    createdAt: DateTimeSchema,
}).meta({ id: 'ChatMessage' });
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatMessagePageSchema = paginated(ChatMessageSchema).meta({ id: 'ChatMessagePage' });
export type ChatMessagePage = z.infer<typeof ChatMessagePageSchema>;

export const ConversationSchema = z.object({
    user: z.object({
        id: z.number().int(),
        username: z.string(),
        profilePicture: z.string().nullable(),
    }),
    lastMessageAt: DateTimeSchema.nullable(),
}).meta({ id: 'Conversation' });
export type Conversation = z.infer<typeof ConversationSchema>;
