import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export function DaySeparator({ children }: { children: ReactNode }) {
    return (
        <Box sx={(t) => ({ alignSelf: 'center', px: 3, py: '2px', borderRadius: t.radius.full, bgcolor: 'cm.surfaceSunken', color: 'text.secondary', fontSize: 12, lineHeight: '16px', fontWeight: 500 })}>
            {children}
        </Box>
    );
}
