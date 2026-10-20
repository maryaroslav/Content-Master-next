import crypto from 'crypto';
import { env } from '../config/env';

const PREFIX = 'v1:';
const key = Buffer.from(env.TWOFA_ENCRYPTION_KEY, 'hex');

export function encryptSecret(plain: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
}

export function decryptSecret(stored: string): string {
    if (!stored.startsWith(PREFIX)) {
        throw new Error('2FA secret is not encrypted; run the database migrations');
    }
    const data = Buffer.from(stored.slice(PREFIX.length), 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8');
}

export const isEncryptedSecret = (value: string) => value.startsWith(PREFIX);
