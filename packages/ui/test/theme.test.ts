import { describe, expect, it } from 'vitest';
import { avatarColor, initials } from '../src/components/UserAvatar';
import { theme } from '../src/theme/theme';
import { resolveColor } from '../src/tokens/model';

describe('MUI theme', () => {
    it('maps the design-system colours onto both colour schemes', () => {
        const light = theme.colorSchemes.light!.palette;
        const dark = theme.colorSchemes.dark!.palette;
        expect(light.primary.main).toBe(resolveColor('accent', 'light'));
        expect(light.ink.main).toBe(resolveColor('primary', 'light'));
        expect(dark.ink.contrastText).toBe(resolveColor('on-primary', 'dark'));
        expect(light.background.default).toBe('#f4f5f7');
        expect(dark.background.paper).toBe('#16181b');
        expect(dark.cm.focus).toBe(resolveColor('accent', 'dark'));
        expect(dark.cm.shadowLg).toContain('rgba(0, 0, 0, 0.6)');
    });

    it('puts every colour and shadow token into palette.cm', () => {
        const keys = Object.keys(theme.colorSchemes.light!.palette.cm).sort();
        expect(keys).toHaveLength(33);
        expect(keys).toEqual(expect.arrayContaining(['canvas', 'surfaceSunken', 'onPrimary', 'lilacLight', 'shadowMd']));
    });

    it('exposes the extra colours as CSS variables', () => {
        expect(theme.vars.palette.cm.surfaceSunken).toBe('var(--mui-palette-cm-surfaceSunken, #eceef1)');
    });

    it('uses the 4px spacing scale, the brand corner and the text styles', () => {
        expect(theme.spacing(4)).toBe('calc(4 * var(--mui-spacing, 4px))');
        expect(theme.shape.borderRadius).toBe(10);
        expect(theme.radius.xl).toBe('20px');
        expect(theme.typography.body1).toMatchObject({ fontSize: '14px', lineHeight: '22px', fontWeight: 400 });
        expect(theme.typography.overline).toMatchObject({ textTransform: 'uppercase', letterSpacing: '0.06em' });
        expect(theme.typography.button.textTransform).toBe('none');
    });

    it('renders text styles that are not headings as text', () => {
        expect(theme.components?.MuiTypography?.defaultProps?.variantMapping).toMatchObject({ subtitle1: 'p', label: 'span', code: 'code' });
    });

    it('takes elevations from the per-scheme shadow tokens', () => {
        expect(theme.shadows[0]).toBe('none');
        expect(theme.shadows[8]).toBe('var(--mui-palette-cm-shadowMd)');
        expect(theme.shadows[24]).toBe('var(--mui-palette-cm-shadowLg)');
    });
});

describe('UserAvatar helpers', () => {
    it('takes initials from the words of a name or username', () => {
        expect(initials('Tomáš Král')).toBe('TK');
        expect(initials('alex_demo')).toBe('AD');
        expect(initials('')).toBe('?');
    });

    it('gives a name the same illustration colour every time', () => {
        expect(avatarColor('alex_demo')).toBe(avatarColor('alex_demo'));
        expect(['cm.lilac', 'cm.amber', 'cm.lilacLight', 'cm.butter']).toContain(avatarColor('tomas.dev'));
    });
});
