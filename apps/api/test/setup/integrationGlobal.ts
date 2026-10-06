import { spawnSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
    export interface ProvidedContext {
        dbName: string;
        uploadDir: string;
    }
}

const API_ROOT = path.resolve(__dirname, '../..');

// Creates a throwaway database on the MySQL server from .env (or CI), migrates it, and drops it afterwards.
export default
async function setup(project: TestProject) {
    const dbName = `cm_test_${crypto.randomBytes(4).toString('hex')}`;
    const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-test-uploads-'));
    Object.assign(process.env, { NODE_ENV: 'test', LOG_LEVEL: 'silent', DB_NAME: dbName, UPLOAD_DIR: uploadDir });

    const { env } = await import('../../src/config/env.js');
    const mysql = await import('mysql2/promise');
    const admin = await mysql.createConnection({ host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASS });

    const teardown = async () => {
        await admin.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await admin.end();
        await fs.rm(uploadDir, { recursive: true, force: true });
    };

    try {
        await admin.query(`CREATE DATABASE \`${dbName}\``);

        // Same command as `pnpm db:migrate`, in its own process: the migration files are loaded by tsx, not by vitest.
        const migrate = spawnSync('pnpm', ['exec', 'tsx', 'src/db/cli.ts', 'up'], { cwd: API_ROOT, env: process.env, encoding: 'utf8' });
        if (migrate.status !== 0) throw new Error(`Migrations failed:\n${migrate.stdout}\n${migrate.stderr}`);
    } catch (err) {
        await teardown();
        throw err;
    }

    project.provide('dbName', dbName);
    project.provide('uploadDir', uploadDir);
    return teardown;
}
