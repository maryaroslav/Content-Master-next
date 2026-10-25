import type { Components, Theme } from '@mui/material/styles';
import { designTokens } from '../tokens/model';

const byName = (tokens: { name: string; value: string }[]) => Object.fromEntries(tokens.map((t) => [t.name, t.value]));
const radius = byName(designTokens.radius.tokens);
const size = byName(designTokens.size.tokens);
const cm = (name: string) => `var(--mui-palette-cm-${name})`;

const focusRing = { outline: `2px solid ${cm('focus')}`, outlineOffset: 2 };

// Soft fills of the status colours: the tint behind, the full colour for the mark, text stays text.
const soft = {
    primary: { bg: cm('accentSoft'), fg: cm('accent') },
    info: { bg: cm('accentSoft'), fg: cm('accent') },
    success: { bg: cm('successSoft'), fg: cm('success') },
    warning: { bg: cm('warningSoft'), fg: cm('warning') },
    error: { bg: cm('dangerSoft'), fg: cm('danger') },
} as const;

export const components: Components<Theme> = {
    MuiCssBaseline: {
        styleOverrides: {
            ':focus-visible': focusRing,
        },
    },
    MuiButtonBase: {
        defaultProps: { disableRipple: true },
        styleOverrides: { root: { '&.Mui-focusVisible': focusRing } },
    },
    MuiButton: {
        defaultProps: { variant: 'contained', color: 'ink', disableElevation: true },
        styleOverrides: {
            root: {
                minWidth: 0,
                height: size['control-md'],
                padding: '0 16px',
                borderRadius: radius['radius-md'],
                whiteSpace: 'nowrap',
                variants: [
                    { props: { size: 'small' }, style: { height: size['control-sm'], padding: '0 12px', fontSize: 13 } },
                    { props: { size: 'large' }, style: { height: size['control-lg'], padding: '0 24px', fontSize: 16 } },
                    // The design system's grey companion button (Back, Cancel, Leave).
                    {
                        props: { variant: 'soft' },
                        style: {
                            backgroundColor: cm('surfaceSunken'),
                            color: cm('text'),
                            '&:hover': { backgroundColor: cm('surfaceHover') },
                            '&.Mui-disabled': { color: cm('textMuted') },
                        },
                    },
                    {
                        props: { variant: 'outlined' },
                        style: { backgroundColor: cm('surface'), borderColor: cm('borderControl'), '&:hover': { backgroundColor: cm('surfaceHover') } },
                    },
                    { props: { variant: 'outlined', color: 'ink' }, style: { color: cm('text') } },
                    { props: { variant: 'text', color: 'ink' }, style: { color: cm('text'), '&:hover': { backgroundColor: cm('surfaceHover') } } },
                ],
            },
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                width: size['control-md'],
                height: size['control-md'],
                borderRadius: radius['radius-md'],
                color: cm('text'),
                '&:hover': { backgroundColor: cm('surfaceHover') },
                variants: [
                    { props: { size: 'small' }, style: { width: size['control-sm'], height: size['control-sm'] } },
                    // The blue shortcut on a profile (message this person).
                    { props: { color: 'primary' }, style: { backgroundColor: cm('accentSoft'), color: cm('accent'), '&:hover': { backgroundColor: cm('accentSoft') } } },
                ],
            },
        },
    },
    MuiInputBase: {
        styleOverrides: {
            root: { fontSize: 14, lineHeight: '22px' },
            input: { '&::placeholder': { color: cm('textMuted'), opacity: 1 } },
        },
    },
    MuiOutlinedInput: {
        // Labels sit above the field (see TextField), so the outline never needs a notch.
        defaultProps: { notched: false },
        styleOverrides: {
            root: {
                backgroundColor: cm('surface'),
                borderRadius: radius['radius-md'],
                '& .MuiOutlinedInput-notchedOutline': { borderColor: cm('borderControl') },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: cm('textMuted') },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: cm('accent'), borderWidth: 2 },
                '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: cm('danger') },
                '&.Mui-disabled': { backgroundColor: cm('surfaceSunken') },
            },
            // The outline is drawn over the field, so the padding alone makes the 40px (32px small) control height.
            input: {
                height: 22,
                padding: '9px 12px',
                variants: [{ props: { size: 'small' }, style: { padding: '5px 12px' } }],
            },
            multiline: { padding: '9px 12px', '& .MuiOutlinedInput-input': { padding: 0 } },
        },
    },
    MuiFormLabel: {
        styleOverrides: {
            root: {
                fontSize: 13,
                lineHeight: '18px',
                fontWeight: 500,
                color: cm('text'),
                '&.Mui-focused, &.Mui-error, &.Mui-disabled': { color: cm('text') },
            },
        },
    },
    MuiFormHelperText: {
        styleOverrides: {
            root: { margin: '4px 0 0', fontSize: 12, lineHeight: '16px', color: cm('textMuted'), '&.Mui-error': { color: cm('danger') } },
        },
    },
    MuiSelect: {
        styleOverrides: { icon: { color: cm('textMuted') } },
    },
    MuiTabs: {
        styleOverrides: {
            root: { minHeight: 44, borderBottom: `1px solid ${cm('border')}` },
            indicator: { height: 2, borderRadius: 2 },
            list: { gap: 24 },
        },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                minWidth: 0,
                minHeight: 44,
                padding: '12px 0',
                fontWeight: 500,
                color: cm('textMuted'),
                '&:hover': { color: cm('text') },
                '&.Mui-selected': { color: cm('accent') },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            // MUI lightens dark-scheme surfaces by elevation; the design system has its own surfaces.
            root: { backgroundImage: 'none' },
            outlined: { borderColor: cm('border') },
        },
    },
    MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderRadius: radius['radius-lg'] } },
    },
    MuiCardHeader: {
        styleOverrides: {
            root: { padding: '20px 20px 0' },
            title: { fontSize: 18, lineHeight: '26px', fontWeight: 600 },
            subheader: { fontSize: 13, lineHeight: '20px', color: cm('textMuted') },
        },
    },
    MuiCardContent: {
        styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } },
    },
    MuiPopover: {
        styleOverrides: { paper: { borderRadius: radius['radius-lg'], border: `1px solid ${cm('border')}` } },
    },
    MuiMenu: {
        styleOverrides: { list: { padding: 4 }, paper: { minWidth: 200 } },
    },
    MuiMenuItem: {
        styleOverrides: {
            root: {
                minHeight: 0,
                padding: '8px 12px',
                borderRadius: radius['radius-sm'],
                fontSize: 14,
                lineHeight: '22px',
                '&:hover': { backgroundColor: cm('surfaceHover') },
                '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: cm('accentSoft') },
            },
        },
    },
    MuiBackdrop: {
        styleOverrides: { root: { variants: [{ props: { invisible: false }, style: { backgroundColor: cm('overlay') } }] } },
    },
    MuiDialog: {
        styleOverrides: { paper: { width: '100%', maxWidth: 440, margin: 16, borderRadius: radius['radius-xl'] } },
    },
    MuiDialogTitle: {
        styleOverrides: { root: { padding: '24px 24px 4px', fontSize: 22, lineHeight: '30px', fontWeight: 600 } },
    },
    MuiDialogContent: {
        styleOverrides: { root: { padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 } },
    },
    MuiDialogContentText: {
        styleOverrides: { root: { fontSize: 13, lineHeight: '20px', color: cm('textMuted') } },
    },
    MuiDialogActions: {
        styleOverrides: { root: { padding: 24, gap: 8, '& > :not(style) ~ :not(style)': { marginLeft: 0 } } },
    },
    MuiAvatar: {
        styleOverrides: {
            root: { width: 40, height: 40, fontSize: 14, fontWeight: 600 },
            colorDefault: { backgroundColor: cm('surfaceSunken'), color: cm('text') },
            rounded: { borderRadius: radius['radius-md'] },
        },
    },
    MuiBadge: {
        styleOverrides: {
            badge: { height: 18, minWidth: 18, padding: '0 5px', fontSize: 11, fontWeight: 600 },
            dot: { width: 10, height: 10, minWidth: 10, backgroundColor: cm('accentBright'), boxShadow: `0 0 0 2px ${cm('surface')}` },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                height: 20,
                borderRadius: radius['radius-sm'],
                fontSize: 11,
                lineHeight: '16px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                backgroundColor: cm('surfaceSunken'),
                color: cm('textMuted'),
                variants: (Object.keys(soft) as (keyof typeof soft)[]).map((color) => ({
                    props: { color, variant: 'filled' },
                    style: { backgroundColor: soft[color].bg, color: soft[color].fg },
                })),
            },
            label: { padding: '0 8px' },
        },
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                padding: '8px 16px',
                borderRadius: radius['radius-md'],
                fontSize: 13,
                lineHeight: '20px',
                color: cm('text'),
                variants: (['info', 'success', 'warning', 'error'] as const).map((severity) => ({
                    props: { variant: 'standard', severity },
                    style: { backgroundColor: soft[severity].bg, color: cm('text'), '& .MuiAlert-icon': { color: soft[severity].fg } },
                })),
            },
            message: { padding: '4px 0' },
            icon: { padding: '5px 0' },
        },
    },
    MuiAlertTitle: {
        styleOverrides: { root: { margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 600 } },
    },
    MuiList: {
        styleOverrides: { root: { display: 'flex', flexDirection: 'column', gap: 4 } },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                gap: 12,
                padding: '8px 12px',
                borderRadius: radius['radius-md'],
                '&:hover': { backgroundColor: cm('surfaceHover') },
                '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: cm('accentSoft') },
            },
        },
    },
    MuiListItemAvatar: {
        styleOverrides: { root: { minWidth: 0 } },
    },
    MuiListItemText: {
        styleOverrides: {
            root: { margin: 0, minWidth: 0 },
            primary: { fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            secondary: { fontSize: 12, lineHeight: '16px', color: cm('textMuted'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        },
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: { backgroundColor: cm('primary'), color: cm('onPrimary'), fontSize: 12, lineHeight: '16px', borderRadius: radius['radius-sm'], padding: '4px 8px' },
        },
    },
    MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: { root: { color: cm('accent'), '&:hover': { color: cm('accentHover') } } },
    },
    MuiDivider: {
        styleOverrides: { root: { borderColor: cm('border') } },
    },
};
