import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import ChatBubbleRounded from '@mui/icons-material/ChatBubbleRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import SmsRounded from '@mui/icons-material/SmsRounded';
import type { SvgIconProps } from '@mui/material/SvgIcon';

// The app's icon set: Material Icons, Rounded only, named by what they mean here.
const icons = {
    addImage: AddPhotoAlternateRounded,
    attach: AttachFileRounded,
    chat: ChatBubbleRounded,
    chevronRight: ChevronRightRounded,
    close: CloseRounded,
    delete: DeleteRounded,
    expand: ExpandMoreRounded,
    messages: SmsRounded,
    more: MoreHorizRounded,
    notifications: NotificationsRounded,
    search: SearchRounded,
    send: SendRounded,
};

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];

export interface IconProps {
    name: IconName;
    size?: 'small' | 'medium' | 'large';
    color?: 'inherit' | 'muted' | 'accent';
    /** Only for an icon that carries meaning on its own; otherwise it is hidden from screen readers. */
    label?: string;
}

const colors = { inherit: 'inherit', muted: 'text.secondary', accent: 'cm.accent' } as const;

export function Icon({ name, size = 'medium', color = 'inherit', label }: IconProps) {
    const Svg = icons[name];
    const props: SvgIconProps = label ? { titleAccess: label } : { 'aria-hidden': true };
    return <Svg fontSize={size} sx={{ color: colors[color] }} {...props} />;
}
