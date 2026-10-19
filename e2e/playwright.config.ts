import { defineConfig, devices } from '@playwright/test';
import { API_PORT, WEB_PORT, WEB_URL, database, uploadDir } from './support/settings';

const ci = !!process.env.CI;

export default defineConfig({
    testDir: 'tests',
    fullyParallel: true,
    forbidOnly: ci,
    retries: ci ? 1 : 0,
    reporter: ci ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
    globalTeardown: './support/global-teardown.ts',
    use: {
        baseURL: WEB_URL,
        locale: 'en-US',
        timezoneId: 'Europe/Prague',
        trace: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: [
        {
            name: 'api',
            command: 'tsx support/prepare-database.ts && pnpm --filter @cm/api db:migrate && pnpm --filter @cm/api start',
            port: API_PORT,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                NODE_ENV: 'test',
                LOG_LEVEL: 'warn',
                PORT: String(API_PORT),
                DB_NAME: database.name,
                UPLOAD_DIR: uploadDir,
                CORS_ORIGINS: WEB_URL,
            },
        },
        {
            name: 'web',
            command: `pnpm --filter @cm/web start -p ${WEB_PORT}`,
            url: WEB_URL,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                API_ORIGIN: `http://localhost:${API_PORT}`,
                REALTIME_URL: `http://localhost:${API_PORT}`,
                APP_ENV: 'test',
            },
        },
    ],
});
