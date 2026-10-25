import Box from '@mui/material/Box';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

/** The mark from apps/web/src/images/logo/logo.svg, drawn in currentColor so it follows the scheme. */
export function LogoMark(props: SvgIconProps) {
    return (
        <SvgIcon viewBox="0 0 54 54" {...props}>
            <circle cx="27" cy="27" r="25" fill="none" stroke="currentColor" strokeWidth="2.17391" strokeLinecap="round" strokeDasharray="6.52 6.52" />
            <circle cx="27" cy="27" r="5" fill="currentColor" />
        </SvgIcon>
    );
}

export interface LogoProps {
    /** Without the name the mark is labelled "Content Master" for screen readers. */
    showName?: boolean;
}

export function Logo({ showName = true }: LogoProps) {
    return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'text.primary', fontWeight: 600, fontSize: 18, lineHeight: '24px', whiteSpace: 'nowrap' }}>
            <LogoMark sx={{ fontSize: 40 }} titleAccess={showName ? undefined : 'Content Master'} />
            {showName ? 'Content Master' : null}
        </Box>
    );
}
