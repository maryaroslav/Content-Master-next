import type {} from '@mui/material/styles';
import type {} from '@mui/material/Button';
import type {} from '@mui/material/Typography';
import type { TypographyStyle } from '@mui/material/styles';

/** Design-system colours with no MUI palette slot (see tokens.json), plus the per-scheme shadows. */
export interface CmColors {
    canvas: string;
    surface: string;
    surfaceSunken: string;
    surfaceHover: string;
    border: string;
    borderControl: string;
    text: string;
    textMuted: string;
    primary: string;
    primaryHover: string;
    onPrimary: string;
    accent: string;
    accentHover: string;
    onAccent: string;
    accentSoft: string;
    accentBright: string;
    danger: string;
    dangerSoft: string;
    onDanger: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    focus: string;
    overlay: string;
    lilac: string;
    lilacLight: string;
    amber: string;
    butter: string;
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
}

interface CmRadius { sm: string; md: string; lg: string; xl: string; full: string }
interface CmSize {
    controlSm: string;
    controlMd: string;
    controlLg: string;
    headerHeight: string;
    sidebarWidth: string;
    feedWidth: string;
    contentMax: string;
    formWidth: string;
}

declare module '@mui/material/styles' {
    // The theme is created with cssVariables, so theme.vars is always there.
    interface CssThemeVariables {
        enabled: true;
    }
    interface Palette {
        ink: Palette['primary'];
        cm: CmColors;
    }
    interface PaletteOptions {
        ink?: PaletteOptions['primary'];
        cm?: CmColors;
    }
    interface Theme {
        radius: CmRadius;
        size: CmSize;
    }
    interface ThemeOptions {
        radius?: CmRadius;
        size?: CmSize;
    }
    interface TypographyVariants {
        display: TypographyStyle;
        bodyLg: TypographyStyle;
        label: TypographyStyle;
        code: TypographyStyle;
    }
    interface TypographyVariantsOptions {
        display?: TypographyStyle;
        bodyLg?: TypographyStyle;
        label?: TypographyStyle;
        code?: TypographyStyle;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        ink: true;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        display: true;
        bodyLg: true;
        label: true;
        code: true;
    }
}
