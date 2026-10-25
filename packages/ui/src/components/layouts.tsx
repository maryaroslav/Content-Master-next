import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Logo } from './Logo';

export interface AppShellProps {
    header: ReactNode;
    tabs?: ReactNode;
    start?: ReactNode;
    /** Accessible names of the side columns; two unnamed <aside> landmarks cannot be told apart. */
    startLabel?: string;
    end?: ReactNode;
    endLabel?: string;
    children: ReactNode;
}

/** Signed-in pages: header, section tabs, then three columns (the right one hides under md, both sides under sm). */
// The three columns and their gaps; tabs and columns share this width so their left edges line up.
const contentWidth = (t: Theme) => `calc(${t.size.sidebarWidth} * 2 + ${t.size.feedWidth} + ${t.spacing(12)})`;

/** The white band under the header that holds the section tabs, aligned with the app shell's columns. */
export function TabsBar({ children }: { children: ReactNode }) {
    return (
        <Box sx={{ bgcolor: 'background.paper', px: { xs: 4, sm: 6 } }}>
            <Box sx={(t) => ({ maxWidth: contentWidth(t), mx: 'auto' })}>{children}</Box>
        </Box>
    );
}

export function AppShell({ header, tabs, start, startLabel, end, endLabel, children }: AppShellProps) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {header}
            {tabs ? <TabsBar>{tabs}</TabsBar> : null}
            <Box
                sx={(t) => ({
                    display: 'grid',
                    gap: 6,
                    alignItems: 'start',
                    boxSizing: 'content-box',
                    maxWidth: contentWidth(t),
                    mx: 'auto',
                    p: { xs: 4, sm: 6 },
                    gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm: `${t.size.sidebarWidth} minmax(0, 1fr)`,
                        md: `${t.size.sidebarWidth} minmax(0, ${t.size.feedWidth}) ${t.size.sidebarWidth}`,
                    },
                })}
            >
                <Stack component="aside" aria-label={startLabel} spacing={4} sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 0 }}>{start}</Stack>
                <Stack component="main" spacing={4} sx={{ minWidth: 0 }}>{children}</Stack>
                <Stack component="aside" aria-label={endLabel} spacing={4} sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}>{end}</Stack>
            </Box>
        </Box>
    );
}

export interface AuthLayoutProps {
    title: ReactNode;
    /** The illustration on the right; hidden on phones. */
    art?: ReactNode;
    children: ReactNode;
}

export function AuthLayout({ title, art, children }: AuthLayoutProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 5fr) minmax(0, 7fr)' }, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Stack component="main" spacing={6} sx={(t) => ({ justifyContent: 'center', width: '100%', maxWidth: t.size.formWidth, mx: 'auto', px: 4, py: 12 })}>
                <Logo />
                <Typography variant="h1">{title}</Typography>
                {children}
            </Stack>
            <Box aria-hidden sx={{ display: { xs: 'none', sm: 'block' }, bgcolor: 'cm.lilac', overflow: 'hidden', '& img': { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } }}>
                {art}
            </Box>
        </Box>
    );
}

export interface ChatLayoutProps {
    /** Accessible name of the conversation list. */
    listLabel: string;
    conversations: ReactNode;
    /** Avatar and name of the open conversation; without it the pane shows `children` alone (e.g. an empty state). */
    peer?: ReactNode;
    composer?: ReactNode;
    children: ReactNode;
}

export function ChatLayout({ listLabel, conversations, peer, composer, children }: ChatLayoutProps) {
    return (
        <Box sx={(t) => ({ display: 'grid', gap: 4, p: 4, height: '100%', minHeight: 0, bgcolor: 'background.default', gridTemplateColumns: { xs: '1fr', sm: `${t.size.sidebarWidth} minmax(0, 1fr)` } })}>
            <Card component="nav" aria-label={listLabel} sx={{ p: 2, overflowY: 'auto', display: { xs: 'none', sm: 'block' } }}>{conversations}</Card>
            <Card component="section" sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {peer ? <Stack direction="row" spacing={3} sx={(t) => ({ alignItems: 'center', px: 4, py: 3, borderBottom: `1px solid ${t.vars.palette.cm.border}` })}>{peer}</Stack> : null}
                <Stack role="log" aria-live="polite" spacing={2} sx={{ flex: 1, p: 4, overflowY: 'auto' }}>{children}</Stack>
                {composer ? <Box sx={{ p: 3 }}>{composer}</Box> : null}
            </Card>
        </Box>
    );
}

export interface SettingsLayoutProps {
    title: ReactNode;
    tabs?: ReactNode;
    children: ReactNode;
}

export function SettingsLayout({ title, tabs, children }: SettingsLayoutProps) {
    return (
        <Stack component="main" spacing={6} sx={{ maxWidth: 720, mx: 'auto', px: 4, py: 8 }}>
            <Typography variant="h1">{title}</Typography>
            {tabs}
            {children}
        </Stack>
    );
}
