import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
    title: ReactNode;
    children?: ReactNode;
    action?: ReactNode;
}

/** What a list shows before it has items: what will appear and how to add the first one. */
export function EmptyState({ title, children, action }: EmptyStateProps) {
    return (
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 8, px: 4 }}>
            <Typography variant="subtitle1" component="h3" sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 600 }}>{title}</Typography>
            {children ? <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '40ch' }}>{children}</Typography> : null}
            {action ? <Stack sx={{ pt: 2 }}>{action}</Stack> : null}
        </Stack>
    );
}
