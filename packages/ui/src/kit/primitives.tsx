import Box from '@mui/material/Box';
import MuiCard from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import MuiTypography from '@mui/material/Typography';
import type { ElementType, FormEventHandler, ReactNode } from 'react';

/** Steps of the 4px spacing scale (space-1 = 4px ... space-16 = 64px). */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | 16;

const variants = {
    display: 'display',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    bodyLg: 'bodyLg',
    body: 'body1',
    bodyStrong: 'subtitle1',
    small: 'body2',
    label: 'label',
    caption: 'caption',
    overline: 'overline',
    code: 'code',
} as const;

const textColors = {
    default: 'text.primary',
    muted: 'text.secondary',
    accent: 'cm.accent',
    danger: 'cm.danger',
    success: 'cm.success',
    inherit: 'inherit',
} as const;

export interface TypographyProps {
    variant?: keyof typeof variants;
    color?: keyof typeof textColors;
    align?: 'start' | 'center' | 'end';
    /** One line with an ellipsis. */
    truncate?: boolean;
    /** The element to render; each variant has a sensible default (h1-h3 headings, the rest paragraphs). */
    as?: ElementType;
    id?: string;
    children: ReactNode;
}

export function Typography({ variant = 'body', color = 'default', align, truncate, as, id, children }: TypographyProps) {
    return (
        <MuiTypography
            variant={variants[variant]}
            component={as ?? (variant === 'overline' || variant === 'caption' || variant === 'label' ? 'span' : undefined) as ElementType}
            id={id}
            noWrap={truncate}
            sx={{ color: textColors[color], textAlign: align, display: variant === 'overline' ? 'block' : undefined }}
        >
            {children}
        </MuiTypography>
    );
}

const alignments = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' } as const;
const justifications = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' } as const;

interface StackOwnProps {
    direction?: 'row' | 'column';
    gap?: Space;
    align?: keyof typeof alignments;
    justify?: keyof typeof justifications;
    wrap?: boolean;
    /** Takes the remaining space in a row. */
    grow?: boolean;
    children: ReactNode;
}

export interface StackProps extends StackOwnProps {
    as?: 'div' | 'section' | 'ul' | 'header' | 'footer';
}

function stackSx({ direction = 'column', gap = 0, align, justify, wrap, grow }: Omit<StackOwnProps, 'children'>) {
    return {
        display: 'flex',
        flexDirection: direction,
        gap,
        alignItems: align ? alignments[align] : undefined,
        justifyContent: justify ? justifications[justify] : undefined,
        flexWrap: wrap ? 'wrap' : undefined,
        flex: grow ? 1 : undefined,
        minWidth: 0,
    } as const;
}

/** One-dimensional layout: children in a row or a column with a gap from the spacing scale. */
export function Stack({ as = 'div', children, ...layout }: StackProps) {
    return <Box component={as} sx={stackSx(layout)}>{children}</Box>;
}

export interface FormProps extends StackOwnProps {
    onSubmit: FormEventHandler<HTMLFormElement>;
    /** Validation is the form's own (zod); keep the browser's bubbles out. */
    noValidate?: boolean;
    'aria-label'?: string;
}

export function Form({ onSubmit, noValidate = true, 'aria-label': ariaLabel, children, gap = 4, ...layout }: FormProps) {
    return <Box component="form" onSubmit={onSubmit} noValidate={noValidate} aria-label={ariaLabel} sx={stackSx({ gap, ...layout })}>{children}</Box>;
}

export interface CardProps {
    padding?: 'none' | 'md' | 'lg';
    as?: 'div' | 'section' | 'article';
    children: ReactNode;
}

const cardPadding = { none: 0, md: 4, lg: 5 } as const;

/** A plain panel on the canvas; for a titled one use SectionCard. */
export function Card({ padding = 'none', as = 'div', children }: CardProps) {
    return <MuiCard component={as} sx={{ p: cardPadding[padding] }}>{children}</MuiCard>;
}

export interface TagProps {
    label: string;
    tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

const tagColors = { neutral: 'default', accent: 'primary', success: 'success', warning: 'warning', danger: 'error' } as const;

/** One or two uppercase words of state or category. */
export function Tag({ label, tone = 'neutral' }: TagProps) {
    return <Chip label={label} color={tagColors[tone]} />;
}
