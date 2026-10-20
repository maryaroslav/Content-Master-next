import { createTheme, type Shadows, type TypographyStyle } from '@mui/material/styles';
import { designTokens } from '../tokens/model';
import { buildPalette } from './palette';

const px = (value: string) => Number.parseFloat(value);
const byName = <T extends { name: string; value: string }>(tokens: T[]) => Object.fromEntries(tokens.map((t) => [t.name, t.value]));

const radius = byName(designTokens.radius.tokens);
const size = byName(designTokens.size.tokens);
const styles = Object.fromEntries(designTokens.type.groups.flatMap((g) => g.styles.map((s) => [s.name, s])));

// next/font provides --font-poppins in the app; Storybook loads the face by its name.
const fontFamily = `var(--font-poppins, "Poppins"), system-ui, -apple-system, "Segoe UI", sans-serif`;
const monoFamily = designTokens.type.families.mono;

function variant(name: string): TypographyStyle {
    const s = styles[name];
    return {
        fontFamily: s.family === 'mono' || name === 'code' ? monoFamily : fontFamily,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        fontWeight: s.fontWeight,
        ...(s.letterSpacing ? { letterSpacing: s.letterSpacing } : {}),
    };
}

// MUI wants 25 elevations; they map onto the three shadow tokens, which differ per colour scheme.
const shadows = Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return 'none';
    if (i === 1) return 'var(--mui-palette-cm-shadowSm)';
    return i <= 8 ? 'var(--mui-palette-cm-shadowMd)' : 'var(--mui-palette-cm-shadowLg)';
}) as Shadows;

export const theme = createTheme({
    cssVariables: { colorSchemeSelector: '[data-theme="%s"]' },
    colorSchemes: {
        light: { palette: buildPalette('light') },
        dark: { palette: buildPalette('dark') },
    },
    spacing: 4,
    shape: { borderRadius: px(radius['radius-md']) },
    radius: { sm: radius['radius-sm'], md: radius['radius-md'], lg: radius['radius-lg'], xl: radius['radius-xl'], full: radius['radius-full'] },
    size: {
        controlSm: size['control-sm'],
        controlMd: size['control-md'],
        controlLg: size['control-lg'],
        headerHeight: size['header-height'],
        sidebarWidth: size['sidebar-width'],
        feedWidth: size['feed-width'],
        contentMax: size['content-max'],
        formWidth: size['form-width'],
    },
    breakpoints: { values: { xs: 0, sm: 760, md: 1100, lg: 1280, xl: 1536 } },
    shadows,
    typography: {
        fontFamily,
        fontSize: 14,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 600,
        display: variant('display'),
        h1: variant('h1'),
        h2: variant('h2'),
        h3: variant('h3'),
        h4: variant('h3'),
        h5: variant('h3'),
        h6: variant('h3'),
        subtitle1: variant('body-strong'),
        subtitle2: variant('label'),
        body1: variant('body'),
        body2: variant('small'),
        bodyLg: variant('body-lg'),
        label: variant('label'),
        caption: variant('caption'),
        overline: { ...variant('overline'), textTransform: 'uppercase' },
        code: variant('code'),
        button: { ...variant('body-strong'), textTransform: 'none' },
    },
    components: {
        MuiTypography: {
            defaultProps: {
                // MUI renders subtitles as <h6>; here they are text styles, not headings.
                variantMapping: { display: 'h1', h4: 'h3', h5: 'h3', h6: 'h3', subtitle1: 'p', subtitle2: 'p', bodyLg: 'p', label: 'span', code: 'code' },
            },
        },
    },
});
