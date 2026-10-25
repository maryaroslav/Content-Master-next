import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Fragment, useId, useState } from 'react';
import { UserAvatar } from './UserAvatar';

export type UserMenuItem = { label: string; href?: string; onClick?: () => void; danger?: boolean; divider?: boolean };

export interface UserMenuProps {
    user: { username: string; avatar?: string | null; color?: string };
    items: UserMenuItem[];
}

export function UserMenu({ user, items }: UserMenuProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const menuId = useId();
    const close = () => setAnchor(null);
    return (
        <>
            <Button
                variant="soft"
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                aria-controls={anchor ? menuId : undefined}
                onClick={(e) => setAnchor(e.currentTarget)}
                startIcon={<UserAvatar name={user.username} src={user.avatar} color={user.color} size="sm" decorative />}
                endIcon={<ExpandMoreRounded />}
                sx={(t) => ({ height: t.size.controlLg, pl: 2, pr: 3, borderRadius: t.radius.full, fontSize: 15 })}
            >
                {user.username}
            </Button>
            <Menu
                id={menuId}
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { mt: 2 } } }}
            >
                {items.map((item) => (
                    <Fragment key={item.label}>
                        {item.divider ? <Divider /> : null}
                        <MenuItem
                            {...(item.href ? { component: 'a', href: item.href } : null)}
                            onClick={() => {
                                close();
                                item.onClick?.();
                            }}
                            sx={item.danger ? { color: 'cm.danger' } : undefined}
                        >
                            {item.label}
                        </MenuItem>
                    </Fragment>
                ))}
            </Menu>
        </>
    );
}
