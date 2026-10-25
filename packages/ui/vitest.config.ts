import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Every MUI deep import the sources use, pre-bundled up front: a dependency discovered mid-run makes Vite
// re-optimize and reload the page, which fails the stories that were rendering at that moment.
const src = fileURLToPath(new URL('src', import.meta.url));
const muiImports = [
    ...new Set(
        (fs.readdirSync(src, { recursive: true }) as string[])
            .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
            .flatMap((f) => [...fs.readFileSync(`${src}/${f}`, 'utf8').matchAll(/from '(@mui\/[^']+)'/g)].map((m) => m[1]!)),
    ),
];

export default mergeConfig(
    viteConfig,
    defineConfig({
        optimizeDeps: { include: [...muiImports, '@emotion/react', '@emotion/styled', 'react', 'react-dom', 'react/jsx-runtime', 'react/compiler-runtime'] },
        test: {
            projects: [
                { extends: true, test: { name: 'unit', include: ['test/**/*.test.{ts,tsx}'] } },
                {
                    // Every story renders in Chromium as a test, with its play function and the a11y check.
                    extends: true,
                    plugins: [storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) })],
                    test: {
                        name: 'storybook',
                        browser: { enabled: true, provider: playwright(), headless: true, instances: [{ browser: 'chromium' }] },
                    },
                },
            ],
        },
    }),
);
