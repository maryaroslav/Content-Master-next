import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { ReactNode } from 'react';
import { Logo } from './Logo';

export interface HeaderProps {
    homeHref: string;
    homeLabel: string;
    search?: ReactNode;
    /** Icon buttons and the user menu, in order. */
    actions?: ReactNode;
}

export function Header({ homeHref, homeLabel, search, actions }: HeaderProps) {
    return (
        <Box
            component="header"
            sx={(t) => ({
                position: 'sticky',
                top: 0,
                zIndex: t.zIndex.appBar,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: t.size.headerHeight,
                px: { xs: 4, sm: 6 },
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${t.vars.palette.cm.border}`,
            })}
        >
            <Link href={homeHref} aria-label={homeLabel} underline="none" color="inherit" sx={{ display: 'inline-flex' }}>
                <Logo />
            </Link>
            {search ? <Box sx={{ flex: 1, maxWidth: 640, display: { xs: 'none', sm: 'block' } }}>{search}</Box> : null}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>{actions}</Box>
        </Box>
    );
}
