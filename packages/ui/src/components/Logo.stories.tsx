import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import ChatBubbleRounded from '@mui/icons-material/ChatBubbleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import EmojiEmotionsRounded from '@mui/icons-material/EmojiEmotionsRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import GifBoxRounded from '@mui/icons-material/GifBoxRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import SmsRounded from '@mui/icons-material/SmsRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import preview from '../../.storybook/preview';
import { Logo } from './Logo';

const meta = preview.meta({ title: 'Foundations' });

export const LogoStory = meta.story({
    name: 'Logo',
    render: () => (
        <Stack direction="row" spacing={8} sx={{ alignItems: 'center' }}>
            <Logo />
            <Logo showName={false} />
        </Stack>
    ),
});

const icons = [
    ['Search', SearchRounded],
    ['Messages', SmsRounded],
    ['Notifications', NotificationsRounded],
    ['Message a person', ChatBubbleRounded],
    ['Open menu', ExpandMoreRounded],
    ['More actions', MoreHorizRounded],
    ['Close', CloseRounded],
    ['Attach', AttachFileRounded],
    ['Add images', AddPhotoAlternateRounded],
    ['GIF', GifBoxRounded],
    ['Emoji', EmojiEmotionsRounded],
    ['Send', SendRounded],
    ['Delete', DeleteRounded],
] as const;

export const Icons = meta.story({
    render: () => (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 6 }}>
            {icons.map(([name, Icon]) => (
                <Stack key={name} spacing={1} sx={{ alignItems: 'center', width: 96 }}>
                    <Icon />
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{name}</Typography>
                </Stack>
            ))}
        </Stack>
    ),
});
