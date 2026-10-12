import os from 'os';
import path from 'path';

// Unit tests never touch the database; fixed values make them independent of the local .env.
Object.assign(process.env, {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DB_HOST: 'localhost',
    DB_NAME: 'unused',
    DB_USER: 'unused',
    JWT_SECRET: 'unit-test-jwt-secret-that-is-long-enough',
    TWOFA_ENCRYPTION_KEY: '0'.repeat(64),
    UPLOAD_DIR: path.join(os.tmpdir(), 'cm-unit-uploads'),
});
