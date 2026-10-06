import crypto from 'crypto';
import sharp from 'sharp';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { storage } from './storage';

const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'gif', 'webp']);

type Preset = 'content' | 'avatar';

export type ImageFolder = 'user_posts' | 'communities_images' | 'chat_images' | 'avatars';

// Decoding with sharp is the content check: anything that is not really an image fails here,
// and re-encoding drops metadata (EXIF, GPS) and whatever else was appended to the file.
async function toWebp(input: Buffer, preset: Preset): Promise<Buffer> {
    const invalid = new AppError(400, 'INVALID_FILE_TYPE', 'Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.');

    let format: string | undefined;
    try {
        format = (await sharp(input).metadata()).format;
    } catch {
        throw invalid;
    }
    if (!format || !ACCEPTED_FORMATS.has(format)) throw invalid;

    if (preset === 'avatar') {
        return sharp(input).autoOrient().resize(512, 512, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
    }
    return sharp(input, { animated: true })
        .autoOrient()
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
}

export async function saveImage(file: Express.Multer.File, folder: ImageFolder): Promise<string> {
    const data = await toWebp(file.buffer, folder === 'avatars' ? 'avatar' : 'content');
    const key = `${folder}/${crypto.randomUUID()}.webp`;
    await storage.save(key, data);
    return key;
}

export async function saveImages(files: Express.Multer.File[], folder: ImageFolder): Promise<string[]> {
    const keys: string[] = [];
    try {
        for (const file of files) keys.push(await saveImage(file, folder));
        return keys;
    } catch (err) {
        await deleteFiles(keys);
        throw err;
    }
}

// Cleanup must not hide the error that caused it, so failures are only logged.
export async function deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(
        keys.map((key) => storage.delete(key).catch((err: unknown) => logger.warn({ err, key }, 'Failed to delete file')))
    );
}
