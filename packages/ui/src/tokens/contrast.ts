import { THEMES, resolveColor, type Theme, type Tokens, designTokens } from './model';

// Every text, mark or control colour with the grounds its usage note promises (WCAG 2: 4.5 text, 3 marks and borders).
const CONTRAST_PAIRS: { fg: string; on: string[]; min: number }[] = [
    { fg: 'text', on: ['canvas', 'surface', 'surface-sunken', 'surface-hover', 'accent-soft', 'danger-soft', 'success-soft', 'warning-soft'], min: 4.5 },
    { fg: 'text-muted', on: ['canvas', 'surface', 'surface-sunken'], min: 4.5 },
    { fg: 'on-primary', on: ['primary', 'primary-hover'], min: 4.5 },
    { fg: 'on-accent', on: ['accent', 'accent-hover'], min: 4.5 },
    { fg: 'on-danger', on: ['danger'], min: 4.5 },
    { fg: 'accent', on: ['surface', 'canvas', 'accent-soft'], min: 4.5 },
    { fg: 'danger', on: ['surface', 'canvas', 'danger-soft'], min: 4.5 },
    { fg: 'success', on: ['surface', 'success-soft'], min: 4.5 },
    { fg: 'warning', on: ['surface', 'warning-soft'], min: 4.5 },
    { fg: 'border-control', on: ['surface', 'canvas'], min: 3 },
    { fg: 'focus', on: ['surface', 'canvas', 'surface-sunken'], min: 3 },
    { fg: 'accent-bright', on: ['surface'], min: 3 },
];

function luminance(hex: string): number {
    const match = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!match) throw new Error(`Contrast needs an opaque #rrggbb colour, got "${hex}"`);
    const [r, g, b] = [0, 2, 4].map((i) => {
        const c = parseInt(match[1].slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastFailure {
    theme: Theme;
    fg: string;
    on: string;
    ratio: number;
    min: number;
}

export function checkContrast(tokens: Tokens = designTokens): ContrastFailure[] {
    const failures: ContrastFailure[] = [];
    for (const theme of THEMES) {
        for (const { fg, on, min } of CONTRAST_PAIRS) {
            for (const bg of on) {
                const ratio = contrastRatio(resolveColor(fg, theme, tokens.color.tokens), resolveColor(bg, theme, tokens.color.tokens));
                if (ratio < min) failures.push({ theme, fg, on: bg, ratio, min });
            }
        }
    }
    return failures;
}
