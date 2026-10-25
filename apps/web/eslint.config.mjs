import nextConfig from '@cm/config-eslint/next';

// Screens still on the old CSS (phase 10c); each step removes its entry.
const notYetOnUi = [
    'src/app/(protected)/chat/**',
    'src/app/(protected)/profile/**',
    'src/app/(protected)/settings/**',
    'src/app/(protected)/(main)/search/**',
    'src/app/page.tsx',
    'src/components/headers/**',
    'src/components/language/**',
    'src/components/welcome/**',
];

const config = [
    ...nextConfig,
    {
        files: ['src/**/*.tsx'],
        rules: {
            // User-facing text lives in messages/*.json (next-intl); the brand name is the same in every language.
            'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true, allowedStrings: ['Content Master', '×'] }],
        },
    },
    {
        // Screens are built from @cm/ui only: its components carry the design system, so the app styles nothing itself.
        files: ['src/**/*.{ts,tsx}'],
        ignores: notYetOnUi,
        rules: {
            'no-restricted-imports': ['error', {
                patterns: [{
                    group: ['@mui/material', '@mui/material/*', '@mui/icons-material', '@mui/icons-material/*', '@mui/system', '@mui/system/*', '@emotion/*'],
                    message: 'Use the components of @cm/ui; add a prop or a component there if something is missing.',
                }],
            }],
            'no-restricted-syntax': ['error', {
                selector: 'JSXAttribute[name.name=/^(sx|style)$/]',
                message: 'No inline styles: use the props of @cm/ui components (variant, gap, align, ...) or add one there.',
            }],
        },
    },
];

export default config;
