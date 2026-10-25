import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import ChatBubbleRounded from '@mui/icons-material/ChatBubbleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import SmsRounded from '@mui/icons-material/SmsRounded';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import preview from '../../.storybook/preview';

const meta = preview.meta({ title: 'Actions' });

export const Buttons = meta.story({
    render: () => (
        <Stack spacing={4}>
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <Button>Sign in</Button>
                <Button color="primary">Send</Button>
                <Button variant="soft">Back</Button>
                <Button variant="outlined">Leave</Button>
                <Button variant="text" startIcon={<AddPhotoAlternateRounded />}>Add images</Button>
                <Button color="error">Delete post</Button>
                <Link component="button" type="button">Retry</Link>
            </Stack>
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <Button size="small">Small</Button>
                <Button>Medium</Button>
                <Button size="large" endIcon={<ExpandMoreRounded />}>Join the Content Master community</Button>
                <Button loading loadingPosition="start">Saving</Button>
                <Button variant="soft" disabled>Disabled</Button>
            </Stack>
        </Stack>
    ),
});

export const IconButtons = meta.story({
    render: () => (
        <Stack direction="row" spacing={3}>
            <IconButton aria-label="Messages, unread">
                <Badge variant="dot" overlap="circular"><SmsRounded /></Badge>
            </IconButton>
            <IconButton aria-label="Notifications"><NotificationsRounded /></IconButton>
            <IconButton aria-label="Message tomas.dev" color="primary"><ChatBubbleRounded /></IconButton>
            <IconButton aria-label="Close" size="small"><CloseRounded fontSize="small" /></IconButton>
        </Stack>
    ),
});
