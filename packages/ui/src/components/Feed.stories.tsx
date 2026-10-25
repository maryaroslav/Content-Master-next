import DeleteRounded from '@mui/icons-material/DeleteRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { expect, fn, waitFor } from 'storybook/test';
import preview from '../../.storybook/preview';
import { EmptyState } from './EmptyState';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { UserAvatar } from './UserAvatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';

const meta = preview.meta({ title: 'Feed' });

const composerLabels = { text: 'New post', placeholder: 'Share your thoughts or ideas', addImages: 'Add images', removeImage: 'Remove image', submit: 'Post', tooManyImages: 'You can attach at most 5 images' };
const pixel = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"%3E%3Crect width="4" height="3" fill="%23c4a0ff"/%3E%3C/svg%3E';

export const Posts = meta.story({
    render: () => (
        <Stack spacing={4} sx={{ maxWidth: 640 }}>
            <PostComposer avatar={<UserAvatar name="alex demo" color="cm.lilac" decorative />} labels={composerLabels} onSubmit={() => true} />
            <PostCard
                author={{ name: 'Tomáš Král', username: 'tomas.dev', color: 'cm.lilac', href: '#tomas' }}
                time="2 hours ago"
                dateTime="2026-10-25T08:00:00+02:00"
                text="Shipped the new chat today: optimistic sending, retries and unread markers."
                images={[{ src: `${pixel}#1`, alt: 'Chat screenshot' }, { src: `${pixel}#2`, alt: 'Unread marker' }]}
                menu={<IconButton aria-label="Delete post" size="small"><DeleteRounded fontSize="small" /></IconButton>}
            />
        </Stack>
    ),
});

export const Submit = meta.story({
    args: { onSubmit: fn(() => true) },
    render: (args) => <PostComposer labels={composerLabels} onSubmit={args.onSubmit} />,
    play: async ({ args, canvas, userEvent }) => {
        const text = canvas.getByRole('textbox', { name: 'New post' });
        await userEvent.click(canvas.getByRole('button', { name: 'Post' }));
        await expect(args.onSubmit).not.toHaveBeenCalled();
        await userEvent.type(text, 'Autumn in Prague');
        await userEvent.click(canvas.getByRole('button', { name: 'Post' }));
        await expect(args.onSubmit).toHaveBeenCalledWith({ text: 'Autumn in Prague', images: [] });
        await waitFor(() => expect(text).toHaveValue(''));
    },
});

export const TooManyImages = meta.story({
    args: { onSubmit: fn(() => true) },
    render: (args) => <PostComposer labels={{ ...composerLabels, tooManyImages: 'You can attach at most 2 images' }} maxImages={2} onSubmit={args.onSubmit} />,
    play: async ({ canvas, canvasElement, userEvent }) => {
        const files = ['a', 'b', 'c'].map((name) => new File(['x'], `${name}.png`, { type: 'image/png' }));
        const input = canvasElement.querySelector<HTMLInputElement>('[data-testid="post-images"]')!;
        await userEvent.upload(input, files);
        await expect(canvas.getByRole('alert')).toHaveTextContent('You can attach at most 2 images');
        await expect(canvas.queryAllByRole('button', { name: 'Remove image' })).toHaveLength(0);
        await userEvent.upload(input, files.slice(0, 2));
        await expect(canvas.getAllByRole('button', { name: 'Remove image' })).toHaveLength(2);
        await expect(canvas.queryByRole('alert')).toBeNull();
    },
});

export const SubmitWithShortcut = meta.story({
    args: { onSubmit: fn(() => true) },
    render: (args) => <PostComposer labels={composerLabels} onSubmit={args.onSubmit} />,
    play: async ({ args, canvas, userEvent }) => {
        const text = canvas.getByRole('textbox', { name: 'New post' });
        await userEvent.type(text, 'Line one{Enter}line two');
        await expect(args.onSubmit).not.toHaveBeenCalled();
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await expect(args.onSubmit).toHaveBeenCalledWith({ text: 'Line one\nline two', images: [] });
    },
});

export const ErrorMessage = meta.story({
    render: () => <PostComposer labels={composerLabels} error="Something went wrong, please try again." onSubmit={() => true} />,
    play: async ({ canvas }) => {
        const text = canvas.getByRole('textbox', { name: 'New post' });
        await expect(text).toBeInvalid();
        await expect(text).toHaveAccessibleDescription('Something went wrong, please try again.');
    },
});

export const KeepsDraftOnError = meta.story({
    args: { onSubmit: fn(() => false) },
    render: (args) => <PostComposer labels={composerLabels} onSubmit={args.onSubmit} />,
    play: async ({ canvas, userEvent }) => {
        const text = canvas.getByRole('textbox', { name: 'New post' });
        await userEvent.type(text, 'Draft');
        await userEvent.click(canvas.getByRole('button', { name: 'Post' }));
        await expect(text).toHaveValue('Draft');
    },
});

export const Empty = meta.story({
    render: () => (
        <Card sx={{ maxWidth: 640 }}>
            <EmptyState title="No posts yet" action={<Button size="small">Write the first post</Button>}>Posts from everyone appear here, newest first.</EmptyState>
        </Card>
    ),
});
