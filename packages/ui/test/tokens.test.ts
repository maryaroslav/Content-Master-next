import { describe, expect, it } from 'vitest';
import { checkContrast, contrastRatio } from '../src/tokens/contrast';
import { designTokens, resolveColor } from '../src/tokens/model';

describe('design tokens', () => {
    it('keep every promised text and mark contrast in both themes', () => {
        expect(checkContrast()).toEqual([]);
    });

    it('report a pair that falls below its minimum', () => {
        const tokens = structuredClone(designTokens);
        tokens.color.tokens.find((t) => t.name === 'text-muted')!.value = { light: '#b0b0b0', dark: '#a4a9b1' };
        expect(checkContrast(tokens)).toContainEqual(expect.objectContaining({ theme: 'light', fg: 'text-muted', on: 'surface' }));
    });

    it('measure contrast like WCAG', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
        expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
    });

    it('follow aliases to a literal colour', () => {
        expect(resolveColor('focus', 'light')).toBe(resolveColor('accent', 'light'));
    });
});
