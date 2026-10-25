import tokens from './tokens.json';

export type Theme = 'light' | 'dark';
export const THEMES: Theme[] = ['light', 'dark'];

interface ThemedToken {
    name: string;
    value: string | Partial<Record<Theme, string>>;
    usage?: string;
}
interface PlainToken {
    name: string;
    value: string;
    usage?: string;
}
interface TypeStyle {
    name: string;
    fontSize: string;
    lineHeight: string;
    fontWeight: number;
    letterSpacing?: string;
    family?: string;
    sample?: string;
    usage?: string;
}
export interface Tokens {
    color: { tokens: ThemedToken[] };
    shadow: { tokens: ThemedToken[] };
    spacing: { tokens: PlainToken[] };
    radius: { tokens: PlainToken[] };
    size: { tokens: PlainToken[] };
    zIndex: { tokens: PlainToken[] };
    type: { families: Record<string, string>; groups: { name: string; family: string; styles: TypeStyle[] }[] };
}

export const designTokens = tokens as Tokens;

/** The value a themed token has in `theme` (a later theme falls back to the first, as in the design system). */
export function themedValue(token: ThemedToken, theme: Theme): string {
    return typeof token.value === 'string' ? token.value : (token.value[theme] ?? token.value.light ?? '');
}

/** A colour with `{alias}` references followed to a literal. */
export function resolveColor(name: string, theme: Theme, all = designTokens.color.tokens): string {
    const token = all.find((t) => t.name === name);
    if (!token) throw new Error(`Unknown colour token "${name}"`);
    const value = themedValue(token, theme);
    const alias = /^\{(.+)\}$/.exec(value);
    return alias ? resolveColor(alias[1], theme, all) : value;
}
