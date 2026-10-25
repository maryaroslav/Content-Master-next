import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ElementType, ReactNode } from 'react';
import { theme } from './theme/theme';

export interface UiProviderProps {
    children: ReactNode;
    /** Rendered for every `href` on MUI components (Link, Button, Tab, ListItemButton), e.g. next/link. */
    linkComponent?: ElementType;
}

/** Theme and baseline styles. Light until every screen supports the dark scheme (phase 10c). */
export function UiProvider({ children, linkComponent }: UiProviderProps) {
    const appTheme = linkComponent
        ? createTheme(theme, {
            components: {
                MuiLink: { defaultProps: { component: linkComponent } },
                MuiButtonBase: { defaultProps: { LinkComponent: linkComponent } },
            },
        })
        : theme;
    return (
        <ThemeProvider theme={appTheme} defaultMode="light">
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
