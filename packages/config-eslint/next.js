import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { sharedRules } from './base.js';

/** Config for Next.js apps. */
export default defineConfig([
    ...nextVitals,
    ...nextTs,
    sharedRules,
    {
        rules: {
            // Existing debt: data fetching in effects is replaced by TanStack Query in migration phase 5.
            'react-hooks/set-state-in-effect': 'warn',
        },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
