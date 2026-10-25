import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';

const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 } as const;
const fontSizes = { xs: 10, sm: 12, md: 14, lg: 18, xl: 32 } as const;

export interface UserAvatarProps {
    name: string;
    src?: string | null;
    /** Background behind the initials; defaults to avatarColor(name). */
    color?: string;
    size?: keyof typeof sizes;
    /** Square corners, for communities. */
    square?: boolean;
    unread?: boolean;
    /** Hide from screen readers when the name is written next to the avatar anyway. */
    decorative?: boolean;
}

const illustrationColors = ['cm.lilac', 'cm.amber', 'cm.lilacLight', 'cm.butter'];

/** A stable illustration colour per name, so a person keeps the same avatar colour everywhere. */
export function avatarColor(name: string): string {
    let hash = 0;
    for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
    return illustrationColors[hash % illustrationColors.length]!;
}

export function initials(name: string): string {
    return name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
}

export function UserAvatar({ name, src, color, size = 'md', square, unread, decorative }: UserAvatarProps) {
    const avatar = (
        <Avatar
            src={src ?? undefined}
            alt={decorative ? '' : name}
            variant={square ? 'rounded' : 'circular'}
            aria-hidden={decorative || undefined}
            sx={{
                width: sizes[size],
                height: sizes[size],
                fontSize: fontSizes[size],
                ...(src ? null : { bgcolor: color ?? avatarColor(name), color: 'cm.onIllustration' }),
            }}
        >
            {src ? null : initials(name)}
        </Avatar>
    );
    return unread ? <Badge variant="dot" overlap={square ? 'rectangular' : 'circular'}>{avatar}</Badge> : avatar;
}
