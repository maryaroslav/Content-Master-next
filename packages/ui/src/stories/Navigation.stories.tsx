import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import preview from '../../.storybook/preview';

const meta = preview.meta({ title: 'Navigation' });

export const SectionTabs = meta.story({
    name: 'Tabs',
    render: () => (
        <Tabs value="explore" aria-label="Sections">
            <Tab value="explore" label="Explore" />
            <Tab value="communities" label="My communities" />
            <Tab value="events" label="Events" />
            <Tab value="settings" label="Settings" />
        </Tabs>
    ),
});

function UserMenu() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const close = () => setAnchor(null);
    return (
        <>
            <Button
                variant="soft"
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                onClick={(e) => setAnchor(e.currentTarget)}
                startIcon={<Avatar aria-hidden sx={{ width: 32, height: 32, bgcolor: 'cm.lilac', color: 'cm.onIllustration' }}>AD</Avatar>}
                endIcon={<ExpandMoreRounded />}
                sx={{ borderRadius: 999, height: 48, pl: 1 }}
            >
                alex_demo
            </Button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={close}>Profile</MenuItem>
                <MenuItem onClick={close}>Settings</MenuItem>
                <Divider />
                <MenuItem onClick={close} sx={{ color: 'error.main' }}>Log out</MenuItem>
            </Menu>
        </>
    );
}

export const UserMenuStory = meta.story({
    name: 'Menu',
    render: () => <UserMenu />,
    play: async ({ canvas, canvasElement, userEvent }) => {
        const trigger = canvas.getByRole('button', { name: 'alex_demo' });
        await userEvent.click(trigger);
        const body = canvasElement.ownerDocument.body;
        await waitFor(() => expect(body.querySelector('[role="menu"]')).not.toBeNull());
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(body.querySelector('[role="menu"]')).toBeNull());
        await expect(trigger).toHaveFocus();
    },
});
