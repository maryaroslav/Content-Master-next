import fs from 'node:fs/promises';
import { dropDatabase } from './database';
import { uploadDir } from './settings';

export default async function globalTeardown() {
    await dropDatabase();
    await fs.rm(uploadDir, { recursive: true, force: true });
}
