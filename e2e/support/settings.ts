import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../../apps/api/.env', import.meta.url)), quiet: true });

process.env.E2E_DB_NAME ??= `cm_e2e_${crypto.randomBytes(4).toString('hex')}`;
process.env.E2E_UPLOAD_DIR ??= path.join(os.tmpdir(), `cm-e2e-uploads-${process.env.E2E_DB_NAME}`);

export const WEB_PORT = 3100;
export const API_PORT = 5101;
export const WEB_URL = `http://localhost:${WEB_PORT}`;
export const API_URL = `http://localhost:${API_PORT}/api/v1`;

export const database = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASS ?? '',
    name: process.env.E2E_DB_NAME,
};

export const uploadDir = process.env.E2E_UPLOAD_DIR;
