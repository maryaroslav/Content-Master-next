import nextConfig from '@cm/config-eslint/next';

const config = [
    ...nextConfig,
    {
        files: ['src/**/*.tsx'],
        rules: {
            // User-facing text lives in messages/*.json (next-intl); the brand name is the same in every language.
            'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true, allowedStrings: ['Content Master', '×'] }],
        },
    },
];

export default config;
