import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
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
