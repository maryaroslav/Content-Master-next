import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import preview from '../../.storybook/preview';

const meta = preview.meta({ title: 'Content' });

export const Avatars = meta.story({
    render: () => (
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'cm.lilac', color: 'cm.onIllustration' }}>TK</Avatar>
            <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'cm.amber', color: 'cm.onIllustration' }}>KV</Avatar>
            <Badge variant="dot" overlap="circular"><Avatar sx={{ bgcolor: 'cm.lilacLight', color: 'cm.onIllustration' }}>PG</Avatar></Badge>
            <Avatar sx={{ width: 56, height: 56, fontSize: 18, bgcolor: 'cm.butter', color: 'cm.onIllustration' }}>AT</Avatar>
            <Avatar sx={{ width: 96, height: 96, fontSize: 32, bgcolor: 'cm.lilac', color: 'cm.onIllustration' }}>TK</Avatar>
            <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'cm.amber', color: 'cm.onIllustration' }}>UD</Avatar>
            <Avatar>NC</Avatar>
            <Badge badgeContent={3} color="primary"><Avatar>KV</Avatar></Badge>
        </Stack>
    ),
});

export const Chips = meta.story({
    render: () => (
        <Stack direction="row" spacing={2}>
            <Chip label="Public" />
            <Chip label="Member" color="primary" />
            <Chip label="2FA on" color="success" />
            <Chip label="Private" color="warning" />
            <Chip label="Failed" color="error" />
        </Stack>
    ),
});

export const Alerts = meta.story({
    render: () => (
        <Stack spacing={3} sx={{ maxWidth: 460 }}>
            <Alert severity="error">Too many requests, please try again later.</Alert>
            <Alert severity="success"><AlertTitle>Two-factor authentication is on</AlertTitle>Signing in asks for a code from your authenticator app.</Alert>
            <Alert severity="warning">You are offline. Messages will be sent when you reconnect.</Alert>
            <Alert severity="info">Can’t scan it? Enter this key in the app instead.</Alert>
        </Stack>
    ),
});

export const Cards = meta.story({
    render: () => (
        <Stack direction="row" spacing={6} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Card sx={{ width: 280 }}>
                <CardHeader title={<Link href="#" color="inherit" underline="none" sx={{ display: 'inline-flex', alignItems: 'center' }}>My communities<ChevronRightRounded /></Link>} />
                <CardContent><Typography variant="body2" color="text.secondary">Communities you created or joined.</Typography></CardContent>
            </Card>
            <Card sx={{ width: 360 }}>
                <CardHeader title="Account" subheader="Signed in as alex_demo@demo.test" action={<Button size="small" variant="soft">Edit</Button>} />
                <CardContent>Email and password</CardContent>
            </Card>
        </Stack>
    ),
});

export const Lists = meta.story({
    render: () => (
        <List sx={{ maxWidth: 420 }} aria-label="Conversations">
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemAvatar><Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'cm.amber', color: 'cm.onIllustration' }}>UD</Avatar></ListItemAvatar>
                    <ListItemText primary="UI Designers Prague" secondary="3 members" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton selected>
                    <ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'cm.lilac', color: 'cm.onIllustration' }}>TD</Avatar></ListItemAvatar>
                    <ListItemText primary="tomas.dev" secondary="Nice, I will try it on my side project." />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemAvatar><Badge variant="dot" overlap="circular"><Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'cm.butter', color: 'cm.onIllustration' }}>KV</Avatar></Badge></ListItemAvatar>
                    <ListItemText primary="katerina_v" secondary="Are you coming on Saturday?" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
                    <Badge badgeContent={2} color="primary" sx={{ mr: 2 }} />
                </ListItemButton>
            </ListItem>
        </List>
    ),
});
