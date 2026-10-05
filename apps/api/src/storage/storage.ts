import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';

export const UPLOAD_ROOT = path.resolve(__dirname, '../..', env.UPLOAD_DIR);
export const UPLOAD_URL_PREFIX = '/uploads';

// Files are addressed by key ("user_posts/<uuid>.webp"); swapping the disk for object storage keeps the keys.
export interface Storage {
    save(key: string, data: Buffer): Promise<void>;
    delete(key: string): Promise<void>;
    url(key: string): string;
}

function resolveKey(key: string): string {
    const filePath = path.resolve(UPLOAD_ROOT, key);
    if (!filePath.startsWith(UPLOAD_ROOT + path.sep)) throw new Error(`Invalid storage key: ${key}`);
    return filePath;
}

export const storage: Storage = {
    async save(key, data) {
        const filePath = resolveKey(key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, data, { flag: 'wx' });
    },
    async delete(key) {
        await fs.rm(resolveKey(key), { force: true });
    },
    url: (key) => `${UPLOAD_URL_PREFIX}/${key}`,
};
