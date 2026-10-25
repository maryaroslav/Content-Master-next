import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

export interface NavTabsProps {
    /** Accessible name of the navigation. */
    label: string;
    items: { label: string; href: string }[];
    current?: string;
}

/** Section navigation that looks like tabs; every item is a page, so these are links with aria-current, not ARIA tabs. */
export function NavTabs({ label, items, current }: NavTabsProps) {
    return (
        <Box component="nav" aria-label={label} sx={(t) => ({ display: 'flex', gap: 6, overflowX: 'auto', borderBottom: `1px solid ${t.vars.palette.cm.border}` })}>
            {items.map((item) => {
                const active = item.href === current;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        underline="none"
                        aria-current={active ? 'page' : undefined}
                        sx={(t) => ({
                            position: 'relative',
                            py: 3,
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            color: active ? 'cm.accent' : 'text.secondary',
                            '&:hover': { color: active ? 'cm.accent' : 'text.primary' },
                            '&::after': active
                                ? { content: '""', position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, borderRadius: 2, bgcolor: t.vars.palette.cm.accent }
                                : undefined,
                        })}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </Box>
    );
}
