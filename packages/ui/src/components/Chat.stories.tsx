import Stack from '@mui/material/Stack';
import { expect, fn } from 'storybook/test';
import preview from '../../.storybook/preview';
import { Composer } from './Composer';
import { DaySeparator } from './DaySeparator';
import { MessageBubble } from './MessageBubble';
import { UserAvatar } from './UserAvatar';

const meta = preview.meta({ title: 'Chat' });

const bubbleLabels = { sending: 'Sending…', notSent: 'Not sent', retry: 'Retry', discard: 'Discard' };
const composerLabels = { message: 'Message', placeholder: 'Write a message…', attach: 'Attach an image', send: 'Send' };
const peer = <UserAvatar name="tomas dev" color="cm.lilac" size="sm" decorative />;

export const Messages = meta.story({
    args: { onRetry: fn(), onDiscard: fn() },
    render: (args) => (
        <Stack spacing={2} sx={{ maxWidth: 640 }}>
            <DaySeparator>Today</DaySeparator>
            <MessageBubble own text="Tomáš, quick question about the API contracts." time="7:57" dateTime="2026-10-25T07:57:00+02:00" labels={bubbleLabels} />
            <MessageBubble text="Shoot." time="8:04" dateTime="2026-10-25T08:04:00+02:00" avatar={peer} labels={bubbleLabels} />
            <MessageBubble own text="Do you generate the client from OpenAPI or write it by hand?" status="pending" labels={bubbleLabels} />
            <MessageBubble own text="Nice, I will try it on my side project." status="failed" onRetry={args.onRetry} onDiscard={args.onDiscard} labels={bubbleLabels} />
        </Stack>
    ),
    play: async ({ args, canvas, userEvent }) => {
        await expect(canvas.getByText('Sending…')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
        await expect(args.onRetry).toHaveBeenCalledOnce();
        await userEvent.click(canvas.getByRole('button', { name: 'Discard' }));
        await expect(args.onDiscard).toHaveBeenCalledOnce();
    },
});

export const ComposerStory = meta.story({
    name: 'Composer',
    args: { onSend: fn(), onAttach: fn() },
    render: (args) => <Composer labels={composerLabels} onSend={args.onSend} onAttach={args.onAttach} />,
    play: async ({ args, canvas, userEvent }) => {
        const input = canvas.getByRole('textbox', { name: 'Message' });
        await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
        await expect(args.onSend).not.toHaveBeenCalled();
        await userEvent.type(input, '  Hello there  {Enter}');
        await expect(args.onSend).toHaveBeenCalledWith('Hello there');
        await expect(input).toHaveValue('');
    },
});
