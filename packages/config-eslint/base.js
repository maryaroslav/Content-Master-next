import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/** Shared rules for every TypeScript package in the monorepo. */
export const sharedRules = {
    rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        // `declare global { namespace Express { ... } }` is the standard way to augment Express types.
        '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
        // Existing debt: switched to "error" in migration phase 2 (api) / phase 5 (web).
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
};

/** Config for Node.js packages (apps/api, tooling). */
export default tseslint.config(
    { ignores: ['dist/**', 'coverage/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    { languageOptions: { globals: globals.node } },
    sharedRules,
);
