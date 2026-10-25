import type { PaletteOptions } from '@mui/material/styles';
import type { CmColors } from './augment';
import { designTokens, resolveColor, themedValue, type Theme } from '../tokens/model';

const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** The MUI palette of one colour scheme, from tokens.json. */
export function buildPalette(scheme: Theme): PaletteOptions {
    const c = (name: string) => resolveColor(name, scheme);
    const ink = { main: c('primary'), dark: c('primary-hover'), light: c('primary-hover'), contrastText: c('on-primary') };
    const shadows = Object.fromEntries(designTokens.shadow.tokens.map((t) => [camel(t.name), themedValue(t, scheme)]));
    return {
        // MUI paints links, focus, selection and tab indicators with `primary`: the design system's blue accent.
        primary: { main: c('accent'), dark: c('accent-hover'), contrastText: c('on-accent') },
        // The one main action of a screen is the ink button (`color="ink"`); secondary mirrors it instead of MUI's purple.
        ink,
        secondary: ink,
        error: { main: c('danger'), contrastText: c('on-danger') },
        warning: { main: c('warning') },
        success: { main: c('success') },
        info: { main: c('accent'), contrastText: c('on-accent') },
        background: { default: c('canvas'), paper: c('surface') },
        text: { primary: c('text'), secondary: c('text-muted') },
        divider: c('border'),
        action: { hover: c('surface-hover'), selected: c('accent-soft'), disabled: c('text-muted'), disabledBackground: c('surface-sunken') },
        // Built from tokens.json at runtime; a test checks it has exactly the keys of CmColors.
        cm: {
            ...Object.fromEntries(designTokens.color.tokens.map((t) => [camel(t.name), c(t.name)])),
            ...shadows,
        } as unknown as CmColors,
    };
}
