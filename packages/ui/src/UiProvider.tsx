import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { theme } from './theme/theme';

/** Theme and baseline styles. Light until every screen supports the dark scheme (phase 10c). */
export function UiProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme} defaultMode="light">
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
