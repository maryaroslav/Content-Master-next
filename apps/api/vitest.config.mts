import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['test/unit/**/*.test.ts'],
                    setupFiles: ['test/setup/unit.ts'],
                },
            },
            {
                test: {
                    name: 'integration',
                    include: ['test/integration/**/*.test.ts'],
                    globalSetup: ['test/setup/integrationGlobal.ts'],
                    setupFiles: ['test/setup/integration.ts'],
                    fileParallelism: false,
                    testTimeout: 20_000,
                    hookTimeout: 60_000,
                },
            },
        ],
    },
});
