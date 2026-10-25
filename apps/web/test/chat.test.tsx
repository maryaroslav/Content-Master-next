import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getChatMessagesMockHandler } from '@cm/api-client/mocks';
import type { Ack, ChatMessage } from '@cm/contracts';
import ChatWindow from '@/app/(protected)/chat/components/ChatWindow';
import ChatRealtime from '@/chat/ChatRealtime';
import AppHeader from '@/components/shell/AppHeader';
import { me, message } from './fixtures';
import { createTestRealtime, renderWithProviders, signIn } from './render';
import { server } from './server';

const bob = { username: 'bob', profilePicture: null };

async function openChat() {
    server.use(getChatMessagesMockHandler({ items: [message(10, 2, me.id, 'hi alice')], nextCursor: null }));
    await signIn();
    const realtime = createTestRealtime();
    const view = renderWithProviders(<ChatWindow peerId={2} peer={bob} me={me} />, { realtime: realtime.client });
    await screen.findByText('hi alice');
    return { ...view, realtime };
}

const ok = (data: ChatMessage): Ack<ChatMessage> => ({ ok: true, data });

describe('chat', () => {
    it('shows a sent message at once and replaces it with the acknowledged one', async () => {
        const { user, realtime } = await openChat();
        let acknowledge!: (result: Ack<ChatMessage>) => void;
        realtime.emit.mockReturnValueOnce(new Promise((resolve) => { acknowledge = resolve as typeof acknowledge; }));

        await user.type(screen.getByPlaceholderText('Write a message...'), 'hello bob{Enter}');

        expect(screen.getByText('Sending...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Write a message...')).toHaveValue('');
        expect(realtime.emit).toHaveBeenCalledWith('message:send', { toUserId: 2, text: 'hello bob' });

        acknowledge(ok(message(11, me.id, 2, 'hello bob')));
        await waitFor(() => expect(screen.queryByText('Sending...')).not.toBeInTheDocument());
        expect(screen.getAllByText('hello bob')).toHaveLength(1);
    });

    it('marks a failed message and sends it again on retry', async () => {
        const { user, realtime } = await openChat();
        realtime.emit
            .mockResolvedValueOnce({ ok: false, error: { code: 'TIMEOUT', message: 'The server did not respond' } })
            .mockResolvedValueOnce(ok(message(12, me.id, 2, 'are you there')));

        await user.type(screen.getByPlaceholderText('Write a message...'), 'are you there{Enter}');

        expect(await screen.findByText('Not sent')).toBeInTheDocument();
        expect(screen.getByText('The server did not respond, please try again')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Retry' }));

        await waitFor(() => expect(screen.queryByText('Not sent')).not.toBeInTheDocument());
        expect(screen.getByText('are you there')).toBeInTheDocument();
        expect(realtime.emit).toHaveBeenCalledTimes(2);
    });

    it('lights the header dot when a message arrives on another page', async () => {
        await signIn();
        const realtime = createTestRealtime();
        renderWithProviders(<><ChatRealtime /><AppHeader /></>, { realtime: realtime.client });
        expect(screen.getByRole('link', { name: 'Messages' })).toBeInTheDocument();

        realtime.deliver('message:new', message(13, 2, me.id, 'ping'));

        expect(await screen.findByRole('link', { name: 'Messages, you have unread ones' })).toBeInTheDocument();
    });
});
