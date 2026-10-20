import { z } from 'zod';
import { ChatMessageSchema } from './chat';
import type { ErrorResponse } from './common';

export const SendMessageSchema = z.object({
    toUserId: z.number().int().positive(),
    text: z.string().max(5000).optional(),
    attachmentIds: z.array(z.number().int().positive()).max(10).optional(),
}).meta({ id: 'SendMessage' });
export type SendMessage = z.infer<typeof SendMessageSchema>;

export type Ack<T> = { ok: true; data: T } | { ok: false; error: ErrorResponse };

export interface ClientEvent {
    name: string;
    payload: z.ZodType;
    ack: z.ZodType;
}

export interface ServerEvent {
    name: string;
    payload: z.ZodType;
}

const defineClientEvent = <const E extends ClientEvent>(event: E): E => event;
const defineServerEvent = <const E extends ServerEvent>(event: E): E => event;

export const clientEvents = {
    sendMessage: defineClientEvent({ name: 'message:send', payload: SendMessageSchema, ack: ChatMessageSchema }),
};

export const serverEvents = {
    newMessage: defineServerEvent({ name: 'message:new', payload: ChatMessageSchema }),
};

type ClientEvents = typeof clientEvents;
type ServerEvents = typeof serverEvents;

export type ClientToServerEvents = {
    [K in keyof ClientEvents as ClientEvents[K]['name']]: (
        payload: z.input<ClientEvents[K]['payload']>,
        ack: (result: Ack<z.output<ClientEvents[K]['ack']>>) => void,
    ) => void;
};

export type ServerToClientEvents = {
    [K in keyof ServerEvents as ServerEvents[K]['name']]: (payload: z.output<ServerEvents[K]['payload']>) => void;
};
