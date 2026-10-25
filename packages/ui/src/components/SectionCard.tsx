import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import type { ReactNode } from 'react';

export interface SectionCardProps {
    title: ReactNode;
    /** Makes the title a link with a chevron, as in "My communities ›". */
    href?: string;
    description?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
    /** Content edge to edge (lists); otherwise padded. */
    flush?: boolean;
    component?: 'section' | 'aside' | 'div';
}

export function SectionCard({ title, href, description, action, children, flush, component = 'section' }: SectionCardProps) {
    const heading = href ? (
        <Link href={href} color="inherit" underline="none" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {title}
            <ChevronRightRounded fontSize="small" />
        </Link>
    ) : title;
    return (
        <Card component={component}>
            <CardHeader title={heading} subheader={description} action={action} slotProps={{ title: { component: 'h2' }, action: { sx: { m: 0, alignSelf: 'center' } } }} />
            {children ? <CardContent sx={flush ? { p: 2, '&:last-child': { pb: 2 } } : undefined}>{children}</CardContent> : null}
        </Card>
    );
}
