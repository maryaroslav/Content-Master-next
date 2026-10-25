import Stack from '@mui/material/Stack';
import { expect, fn } from 'storybook/test';
import preview from '../../.storybook/preview';
import { SearchField } from './SearchField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

const meta = preview.meta({ title: 'Forms', parameters: { layout: 'padded' } });

const privacy = [{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }];

export const Fields = meta.story({
    render: () => (
        <Stack spacing={4} sx={{ maxWidth: 400 }}>
            <TextField label="Email" type="email" placeholder="name@example.com" />
            <TextField label="Community name" defaultValue="Prague Frontend Meetup" maxLength={48} showCount hint="You can change the name later." />
            <TextField label="Password" type="password" defaultValue="short" error="At least 8 characters" />
            <TextField label="Bio" multiline minRows={3} defaultValue="Product designer in Prague." />
            <TextField label="Code from the app" code placeholder="123456" />
            <TextField label="Email" size="large" placeholder="name@example.com" />
            <SelectField label="Community privacy" options={privacy} defaultValue="public" />
        </Stack>
    ),
});

export const Counter = meta.story({
    render: () => <TextField label="Community name" maxLength={48} showCount />,
    play: async ({ canvas, userEvent }) => {
        await userEvent.type(canvas.getByLabelText('Community name'), 'Hikers');
        await expect(canvas.getByText('6/48')).toBeInTheDocument();
    },
});

export const ErrorMessage = meta.story({
    render: () => <TextField label="Password" type="password" error="At least 8 characters" />,
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Password');
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        await expect(input).toHaveAccessibleDescription('At least 8 characters');
    },
});

export const Select = meta.story({
    render: () => <SelectField label="Community privacy" options={privacy} defaultValue="public" />,
    play: async ({ canvas, canvasElement, userEvent }) => {
        await userEvent.click(canvas.getByRole('combobox', { name: 'Community privacy' }));
        const listbox = await canvasElement.ownerDocument.body.querySelector('[role="listbox"]');
        await expect(listbox).not.toBeNull();
        await userEvent.keyboard('{ArrowDown}{Enter}');
        await expect(canvas.getByRole('combobox', { name: 'Community privacy' })).toHaveTextContent('Private');
    },
});

export const Search = meta.story({
    args: { onSearch: fn() },
    render: (args) => <SearchField placeholder="Search people and communities" onSearch={args.onSearch} />,
    play: async ({ args, canvas, userEvent }) => {
        await userEvent.type(canvas.getByRole('searchbox', { name: 'Search people and communities' }), '  hikers {Enter}');
        await expect(args.onSearch).toHaveBeenCalledWith('hikers');
    },
});
