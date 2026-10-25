import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import SmsRounded from '@mui/icons-material/SmsRounded';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { expect, waitFor } from 'storybook/test';
import preview from '../../.storybook/preview';
import { Composer } from './Composer';
import { DaySeparator } from './DaySeparator';
import { Header } from './Header';
import { AppShell, AuthLayout, ChatLayout, SettingsLayout } from './layouts';
import { MessageBubble } from './MessageBubble';
import { NavTabs } from './NavTabs';
import { PostCard } from './PostCard';
import { SearchField } from './SearchField';
import { SectionCard } from './SectionCard';
import { TextField } from './TextField';
import { UserAvatar } from './UserAvatar';
import { UserMenu } from './UserMenu';

const meta = preview.meta({ title: 'Layouts', parameters: { layout: 'fullscreen' } });

const user = { username: 'alex_demo', color: 'cm.lilac' };
const menuItems = [{ label: 'Profile', href: '#profile' }, { label: 'Settings', href: '#settings' }, { label: 'Log out', danger: true, divider: true }];
const bubbleLabels = { sending: 'Sending…', notSent: 'Not sent', retry: 'Retry', discard: 'Discard' };

const header = (
    <Header
        homeHref="#explore"
        homeLabel="Content Master, home"
        search={<SearchField placeholder="Search" />}
        actions={
            <>
                <IconButton aria-label="Messages, unread" href="#chat"><Badge variant="dot" overlap="circular"><SmsRounded /></Badge></IconButton>
                <IconButton aria-label="Notifications"><NotificationsRounded /></IconButton>
                <UserMenu user={user} items={menuItems} />
            </>
        }
    />
);

const community = (name: string, members: string, color: string) => (
    <ListItem disablePadding>
        <ListItemButton href={`#${name}`}>
            <ListItemAvatar><UserAvatar name={name} color={color} square decorative /></ListItemAvatar>
            <ListItemText primary={name} secondary={members} />
        </ListItemButton>
    </ListItem>
);

export const Shell = meta.story({
    name: 'AppShell',
    render: () => (
        <AppShell
            header={header}
            tabs={<NavTabs label="Sections" current="#explore" items={[{ label: 'Explore', href: '#explore' }, { label: 'My communities', href: '#communities' }, { label: 'Events', href: '#events' }, { label: 'Settings', href: '#settings' }]} />}
            startLabel="Your communities and events"
            endLabel="Discover"
            start={
                <SectionCard title="My communities" href="#communities" flush>
                    <List aria-label="My communities">{community('UI Designers Prague', '3 members', 'cm.amber')}{community('Weekend Hikers', '4 members', 'cm.lilac')}</List>
                </SectionCard>
            }
            end={<><SectionCard title="Popular tags" href="#tags" /><SectionCard title="Podcasts" href="#podcasts" /></>}
        >
            <PostCard author={{ name: 'Tomáš Král', username: 'tomas.dev', color: 'cm.lilac' }} time="2 hours ago" dateTime="2026-10-25T08:00:00+02:00" text="Shipped the new chat today." />
        </AppShell>
    ),
    play: async ({ canvas, canvasElement, userEvent }) => {
        await expect(canvas.getByRole('link', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
        await userEvent.click(canvas.getByRole('button', { name: 'alex_demo' }));
        const body = canvasElement.ownerDocument.body;
        await waitFor(() => expect(body.querySelector('[role="menu"]')).not.toBeNull());
        await userEvent.keyboard('{Escape}');
    },
});

export const Auth = meta.story({
    name: 'AuthLayout',
    render: () => (
        <AuthLayout title="Sign in to your account">
            <form noValidate>
                <TextField label="Email" type="email" size="large" placeholder="name@example.com" sx={{ mb: 4 }} />
                <TextField label="Password" type="password" size="large" sx={{ mb: 4 }} />
                <Alert severity="error" sx={{ mb: 4 }}>Invalid email or password.</Alert>
                <Button type="submit" size="large" fullWidth>Sign in</Button>
            </form>
            <Typography variant="body2" color="text.secondary">Don’t have an account? <Link href="#register">Create account</Link></Typography>
        </AuthLayout>
    ),
});

export const Chat = meta.story({
    name: 'ChatLayout',
    render: () => (
        <div style={{ height: 560 }}>
            <ChatLayout
                listLabel="Conversations"
                conversations={
                    <List aria-label="Conversations">
                        <ListItem disablePadding><ListItemButton href="#k"><ListItemAvatar><UserAvatar name="katerina v" color="cm.amber" size="sm" unread decorative /></ListItemAvatar><ListItemText primary="katerina_v" slotProps={{ primary: { sx: { fontWeight: 600 } } }} /></ListItemButton></ListItem>
                        <ListItem disablePadding><ListItemButton href="#t" selected aria-current="page"><ListItemAvatar><UserAvatar name="tomas dev" color="cm.lilac" size="sm" decorative /></ListItemAvatar><ListItemText primary="tomas.dev" /></ListItemButton></ListItem>
                    </List>
                }
                peer={<><UserAvatar name="tomas dev" color="cm.lilac" size="sm" decorative /><Typography variant="subtitle1" component="h2">tomas.dev</Typography></>}
                composer={<Composer labels={{ message: 'Message', placeholder: 'Write a message…', attach: 'Attach an image', send: 'Send' }} onSend={() => {}} onAttach={() => {}} />}
            >
                <DaySeparator>Today</DaySeparator>
                <MessageBubble own text="Tomáš, quick question about the API contracts." time="7:57" dateTime="2026-10-25T07:57:00+02:00" labels={bubbleLabels} />
                <MessageBubble text="Generated with orval." time="8:18" dateTime="2026-10-25T08:18:00+02:00" avatar={<UserAvatar name="tomas dev" color="cm.lilac" size="sm" decorative />} labels={bubbleLabels} />
            </ChatLayout>
        </div>
    ),
});

export const Settings = meta.story({
    name: 'SettingsLayout',
    render: () => (
        <SettingsLayout title="Settings">
            <SectionCard title="Account" description="Signed in as alex_demo@demo.test">
                <TextField label="New email" type="email" sx={{ maxWidth: 400, mb: 4 }} />
                <TextField label="Current password" type="password" sx={{ maxWidth: 400, mb: 4 }} />
                <Button>Change email</Button>
            </SectionCard>
            <SectionCard title="Two-factor authentication" action={<Chip label="On" color="success" />}>
                <Alert severity="success" sx={{ mb: 4 }}>Signing in asks for a code from your authenticator app.</Alert>
                <Button variant="soft">Turn off</Button>
            </SectionCard>
        </SettingsLayout>
    ),
});
