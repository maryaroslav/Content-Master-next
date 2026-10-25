import Badge from '@mui/material/Badge';
import MuiButton from '@mui/material/Button';
import MuiIconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useId, useState, type MouseEventHandler, type ReactNode } from 'react';
import { Icon, type IconName } from './icons';

const buttonVariants = {
    primary: { variant: 'contained', color: 'ink' },
    accent: { variant: 'contained', color: 'primary' },
    secondary: { variant: 'soft', color: 'ink' },
    outline: { variant: 'outlined', color: 'ink' },
    ghost: { variant: 'text', color: 'ink' },
    danger: { variant: 'contained', color: 'error' },
} as const;

interface PressableProps {
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    type?: 'button' | 'submit';
    disabled?: boolean;
    'aria-label'?: string;
    'aria-haspopup'?: 'menu' | 'dialog';
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
}

export interface ButtonProps extends PressableProps {
    /** primary: the one main action of a screen (ink); accent: blue-context actions; secondary: its grey companion. */
    variant?: keyof typeof buttonVariants;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    startIcon?: IconName;
    endIcon?: IconName;
    children: ReactNode;
}

export function Button({ variant = 'primary', size = 'medium', fullWidth, loading, startIcon, endIcon, type = 'button', children, ...rest }: ButtonProps) {
    return (
        <MuiButton
            {...buttonVariants[variant]}
            size={size}
            fullWidth={fullWidth}
            loading={loading}
            type={type}
            startIcon={startIcon ? <Icon name={startIcon} /> : undefined}
            endIcon={endIcon ? <Icon name={endIcon} /> : undefined}
            {...rest}
        >
            {children}
        </MuiButton>
    );
}

export interface IconButtonProps extends Omit<PressableProps, 'aria-label'> {
    icon: IconName;
    /** Required: the button has no visible text. */
    label: string;
    size?: 'small' | 'medium';
    /** accent: the soft blue shortcut (message this person). */
    tone?: 'plain' | 'accent';
    /** The unread dot; say "unread" in the label too. */
    dot?: boolean;
}

export function IconButton({ icon, label, size = 'medium', tone = 'plain', dot, ...rest }: IconButtonProps) {
    return (
        <MuiIconButton aria-label={label} size={size} color={tone === 'accent' ? 'primary' : 'default'} {...rest}>
            <Badge variant="dot" overlap="circular" invisible={!dot}>
                <Icon name={icon} size={size} />
            </Badge>
        </MuiIconButton>
    );
}

export interface TextLinkProps {
    /** A link to `href`, or a button that looks like a link when only `onClick` is given. */
    href?: string;
    onClick?: () => void;
    color?: 'accent' | 'inherit';
    children: ReactNode;
}

export function TextLink({ href, onClick, color = 'accent', children }: TextLinkProps) {
    const sx = color === 'inherit' ? { color: 'inherit', fontWeight: 500 } : undefined;
    if (href) return <MuiLink href={href} sx={sx}>{children}</MuiLink>;
    return <MuiLink component="button" type="button" onClick={onClick} sx={{ ...sx, alignSelf: 'flex-start', font: 'inherit' }}>{children}</MuiLink>;
}

export interface ActionMenuItem {
    label: string;
    onSelect: () => void;
    danger?: boolean;
}

export interface ActionMenuProps {
    /** Accessible name of the trigger, e.g. "Post options". */
    label: string;
    icon?: IconName;
    items: ActionMenuItem[];
}

/** An icon button that opens a menu of actions; destructive ones last. */
export function ActionMenu({ label, icon = 'more', items }: ActionMenuProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const menuId = useId();
    return (
        <>
            <IconButton
                icon={icon}
                label={label}
                size="small"
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                aria-controls={anchor ? menuId : undefined}
                onClick={(e) => setAnchor(e.currentTarget)}
            />
            <Menu
                id={menuId}
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {items.map((item) => (
                    <MenuItem
                        key={item.label}
                        onClick={() => {
                            setAnchor(null);
                            item.onSelect();
                        }}
                        sx={item.danger ? { color: 'cm.danger' } : undefined}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
