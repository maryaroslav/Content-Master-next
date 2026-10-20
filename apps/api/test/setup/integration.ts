import { afterAll, inject } from 'vitest';

// Runs in each test worker before the test file imports the app, so config/env.ts sees these values.
Object.assign(process.env, {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DB_NAME: inject('dbName'),
    UPLOAD_DIR: inject('uploadDir'),
});

afterAll(async () => {
    const { sequelize } = await import('../../src/models/index.js');
    await sequelize.close();
});
