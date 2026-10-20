import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import preview from '../../.storybook/preview';
import { theme } from '../theme/theme';
import { designTokens } from './model';

const meta = preview.meta({ title: 'Foundations' });

const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function TokenTable({ head, children }: { head: string[]; children: ReactNode }) {
    return (
        <Paper variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>{head.map((h) => <TableCell key={h}><Typography variant="label">{h}</Typography></TableCell>)}</TableRow>
                </TableHead>
                <TableBody>{children}</TableBody>
            </Table>
        </Paper>
    );
}

export const Colors = meta.story({
    render: () => (
        <TokenTable head={['Swatch', 'Variable', 'Usage']}>
            {designTokens.color.tokens.map((t) => (
                <TableRow key={t.name}>
                    <TableCell>
                        <Box sx={{ width: 48, height: 32, borderRadius: 1, bgcolor: `cm.${camel(t.name)}`, boxShadow: (th) => `inset 0 0 0 1px ${th.vars.palette.divider}` }} />
                    </TableCell>
                    <TableCell><Typography variant="code">palette.cm.{camel(t.name)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{t.usage}</Typography></TableCell>
                </TableRow>
            ))}
        </TokenTable>
    ),
});

const variants = ['display', 'h1', 'h2', 'h3', 'bodyLg', 'body1', 'subtitle1', 'body2', 'label', 'caption', 'overline', 'code'] as const;

export const Typography_ = meta.story({
    name: 'Typography',
    render: () => (
        <Stack spacing={4}>
            {variants.map((v) => (
                <Stack key={v} direction="row" spacing={6} sx={{ alignItems: 'baseline' }}>
                    <Typography variant="code" color="text.secondary" sx={{ width: 120, flex: 'none' }}>{v}</Typography>
                    <Typography variant={v} component="p">Ask questions, share ideas and make new connections</Typography>
                </Stack>
            ))}
        </Stack>
    ),
});

export const SpacingAndRadius = meta.story({
    name: 'Spacing and radius',
    render: () => (
        <TokenTable head={['Token', 'Example', 'Usage']}>
            {designTokens.spacing.tokens.map((t) => (
                <TableRow key={t.name}>
                    <TableCell><Typography variant="code">{t.name} · theme.spacing({Number.parseFloat(t.value) / 4})</Typography></TableCell>
                    <TableCell><Box sx={{ width: t.value, height: 16, bgcolor: 'primary.main' }} /></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{t.usage}</Typography></TableCell>
                </TableRow>
            ))}
            {designTokens.radius.tokens.map((t) => (
                <TableRow key={t.name}>
                    <TableCell><Typography variant="code">{t.name} · theme.radius.{t.name.replace('radius-', '')}</Typography></TableCell>
                    <TableCell><Box sx={{ width: 64, height: 40, borderRadius: t.value, bgcolor: 'cm.surfaceSunken', border: 1, borderColor: 'cm.borderControl' }} /></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{t.usage}</Typography></TableCell>
                </TableRow>
            ))}
        </TokenTable>
    ),
});

export const Shadows = meta.story({
    render: () => (
        <Stack direction="row" spacing={8} sx={{ p: 6, bgcolor: 'background.default', flexWrap: 'wrap' }}>
            {([[1, 'shadow-sm'], [8, 'shadow-md'], [24, 'shadow-lg']] as const).map(([elevation, name]) => (
                <Paper key={name} elevation={elevation} sx={{ width: 200, p: 5, borderRadius: theme.radius.lg }}>
                    <Typography variant="code">elevation {elevation}</Typography>
                    <Typography variant="body2" color="text.secondary">{designTokens.shadow.tokens.find((t) => t.name === name)?.usage}</Typography>
                </Paper>
            ))}
        </Stack>
    ),
});
