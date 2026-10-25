import { useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';
import preview from '../../.storybook/preview';
import { SectionCard } from '../components/SectionCard';
import { TextField } from '../components/TextField';
import { ActionMenu, Button, IconButton, TextLink } from './actions';
import { ChoiceCard, ImagePicker, RadioList } from './choices';
import { ConfirmDialog, WizardDialog } from './dialogs';
import { Alert, ErrorState, LoadingState } from './feedback';
import { EntityList, EntityRow } from './lists';
import { Card, Form, Stack, Tag, Typography } from './primitives';

const meta = preview.meta({ title: 'Kit' });

const cover = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"%3E%3Crect width="4" height="4" fill="%23ffc655"/%3E%3C/svg%3E';

export const Text = meta.story({
    render: () => (
        <Stack gap={3}>
            <Typography variant="h1">Sign in to your account</Typography>
            <Typography variant="h2">Created communities</Typography>
            <Typography variant="body">Generated with orval.</Typography>
            <Typography variant="small" color="muted">@tomas.dev · 1 follower</Typography>
            <Typography variant="overline" color="muted">Public</Typography>
            <Stack direction="row" gap={2} align="center">
                <Tag label="Member" tone="accent" />
                <Tag label="2FA on" tone="success" />
                <TextLink href="#">Create account</TextLink>
            </Stack>
        </Stack>
    ),
});

export const Actions = meta.story({
    args: { onDelete: fn() },
    render: (args) => (
        <Stack direction="row" gap={3} align="center" wrap>
            <Button>Sign in</Button>
            <Button variant="accent">Send</Button>
            <Button variant="secondary">Back</Button>
            <Button variant="outline">Leave</Button>
            <Button variant="ghost" startIcon="addImage">Add images</Button>
            <Button variant="danger">Delete post</Button>
            <IconButton icon="messages" label="Messages, unread" dot />
            <IconButton icon="chat" label="Message tomas.dev" tone="accent" />
            <ActionMenu label="Post options" items={[{ label: 'Delete post', danger: true, onSelect: args.onDelete }]} />
        </Stack>
    ),
    play: async ({ args, canvas, canvasElement, userEvent }) => {
        await userEvent.click(canvas.getByRole('button', { name: 'Post options' }));
        const body = canvasElement.ownerDocument.body;
        await waitFor(() => expect(body.querySelector('[role="menu"]')).not.toBeNull());
        const item = [...body.querySelectorAll<HTMLElement>('[role="menuitem"]')].find((el) => el.textContent === 'Delete post')!;
        await userEvent.click(item);
        await expect(args.onDelete).toHaveBeenCalledOnce();
    },
});

export const States = meta.story({
    args: { onRetry: fn() },
    render: (args) => (
        <Stack gap={4}>
            <LoadingState label="Loading posts" />
            <ErrorState message="Something went wrong, please try again." retryLabel="Try again" onRetry={args.onRetry} />
            <Alert severity="success" title="Saved">Your profile is up to date.</Alert>
        </Stack>
    ),
    play: async ({ args, canvas, userEvent }) => {
        await expect(canvas.getByRole('status', { name: 'Loading posts' })).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
        await expect(args.onRetry).toHaveBeenCalledOnce();
    },
});

export const Rows = meta.story({
    render: () => (
        <Stack gap={4}>
            <SectionCard title="My communities" flush>
                <EntityList label="My communities">
                    <EntityRow image={cover} overline="Public" title="UI Designers Prague" meta="3 members" action={<Button variant="secondary" size="small">Leave</Button>} />
                    <EntityRow image={cover} imageSize="xl" title="Design Meetup #12" meta={['6. 10. 2026', '3 people have joined']} />
                </EntityList>
            </SectionCard>
            <Card>
                <EntityList label="Conversations">
                    <EntityRow href="#k" image={null} imageSize="sm" title="katerina_v" unread />
                    <EntityRow href="#t" image={null} imageSize="sm" title="tomas.dev" selected />
                </EntityList>
            </Card>
        </Stack>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole('link', { name: 'tomas.dev' })).toHaveAttribute('aria-current', 'page');
        await expect(canvas.getByRole('list', { name: 'My communities' })).toBeInTheDocument();
    },
});

export const Confirm = meta.story({
    args: { onConfirm: fn() },
    render: (args) => {
        function Demo() {
            const [open, setOpen] = useState(false);
            return (
                <>
                    <Button variant="danger" onClick={() => setOpen(true)}>Delete post</Button>
                    <ConfirmDialog
                        open={open}
                        danger
                        title="Delete this post?"
                        text="It disappears from the feed for everyone."
                        confirmLabel="Delete post"
                        cancelLabel="Cancel"
                        onConfirm={() => { setOpen(false); args.onConfirm(); }}
                        onClose={() => setOpen(false)}
                    />
                </>
            );
        }
        return <Demo />;
    },
    play: async ({ args, canvas, canvasElement, userEvent }) => {
        const body = canvasElement.ownerDocument.body;
        await userEvent.click(canvas.getByRole('button', { name: 'Delete post' }));
        await waitFor(() => expect(body.querySelector('[role="dialog"]')).not.toBeNull());
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(body.querySelector('[role="dialog"]')).toBeNull());
        await expect(args.onConfirm).not.toHaveBeenCalled();
    },
});

export const Wizard = meta.story({
    render: () => {
        function Demo() {
            const [open, setOpen] = useState(false);
            const [step, setStep] = useState(0);
            const [theme, setTheme] = useState('');
            const [photo, setPhoto] = useState<File | null>(null);
            const steps = [
                { title: 'What is your goal?', description: 'Every feature is available either way.' },
                { title: 'Choose a name', description: 'You can change the name later.' },
                { title: 'Choose a theme', description: 'It does not limit the community.' },
                { title: 'Add a photo', description: 'Shown next to the name.' },
            ];
            const current = steps[step]!;
            return (
                <>
                    <Button onClick={() => setOpen(true)}>Create community</Button>
                    <WizardDialog
                        open={open}
                        onClose={() => setOpen(false)}
                        onExited={() => setStep(0)}
                        closeLabel="Close"
                        title={current.title}
                        description={current.description}
                        progress={step > 0 ? { current: step, total: 3, label: `Step ${step} of 3` } : undefined}
                        back={step > 0 ? { label: 'Back', onClick: () => setStep(step - 1) } : undefined}
                        next={step > 0 ? { label: step === 3 ? 'Create' : 'Continue', onClick: () => setStep(Math.min(step + 1, 3)) } : undefined}
                    >
                        {step === 0 && <ChoiceCard title="Share content and communicate" text="Run a blog or an interest group." onClick={() => setStep(1)} />}
                        {step === 1 && <TextField label="Community name" maxLength={48} showCount />}
                        {step === 2 && <RadioList label="Theme" value={theme} onChange={setTheme} groups={[{ options: [{ value: 'Business', label: 'Business' }, { value: 'Design', label: 'Design' }] }, { label: 'Entertainment', options: [{ value: 'Games', label: 'Games' }] }]} />}
                        {step === 3 && <ImagePicker value={photo} onChange={setPhoto} addLabel="Add photo" changeLabel="Change photo" previewAlt="Selected photo" />}
                    </WizardDialog>
                </>
            );
        }
        return <Demo />;
    },
    play: async ({ canvas, canvasElement, userEvent }) => {
        const body = canvasElement.ownerDocument.body;
        const dialog = () => body.querySelector<HTMLElement>('[role="dialog"]');
        await userEvent.click(canvas.getByRole('button', { name: 'Create community' }));
        await waitFor(() => expect(dialog()).toHaveAccessibleName('What is your goal?'));
        await userEvent.click([...body.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent?.includes('Share content'))!);
        await waitFor(() => expect(dialog()).toHaveAccessibleName('Choose a name'));
        await expect(body.textContent).toContain('Step 1 of 3');
        await userEvent.click([...body.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === 'Continue')!);
        const radio = body.querySelector<HTMLInputElement>('input[value="Design"]')!;
        await userEvent.click(radio);
        await expect(radio).toBeChecked();
        await userEvent.click(body.querySelector<HTMLElement>('[aria-label="Close"]')!);
        await waitFor(() => expect(dialog()).toBeNull());
        await userEvent.click(canvas.getByRole('button', { name: 'Create community' }));
        await waitFor(() => expect(dialog()).toHaveAccessibleName('What is your goal?'));
    },
});

export const FormLayout = meta.story({
    args: { onSubmit: fn((e: { preventDefault: () => void }) => e.preventDefault()) },
    render: (args) => (
        <Form onSubmit={args.onSubmit} aria-label="Sign in">
            <TextField label="Email" type="email" size="large" />
            <TextField label="Theme" icon="search" type="search" />
            <Button type="submit" size="large" fullWidth>Sign in</Button>
        </Form>
    ),
    play: async ({ args, canvas, userEvent }) => {
        await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
        await expect(args.onSubmit).toHaveBeenCalledOnce();
    },
});
