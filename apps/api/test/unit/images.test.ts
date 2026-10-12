import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import { saveImage } from '../../src/storage/images';
import { UPLOAD_ROOT } from '../../src/storage/storage';

const asUpload = (buffer: Buffer) => ({ buffer }) as Express.Multer.File;

const image = (width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: { r: 200, g: 30, b: 30 } } });

const stored = async (key: string) => sharp(await fs.readFile(path.join(UPLOAD_ROOT, key))).metadata();

afterAll(() => fs.rm(UPLOAD_ROOT, { recursive: true, force: true }));

describe('saveImage', () => {
    it('re-encodes to WebP without metadata', async () => {
        const jpeg = await image(80, 60).jpeg().withExif({ IFD0: { Copyright: 'secret-owner' } }).toBuffer();
        const key = await saveImage(asUpload(jpeg), 'user_posts');

        expect(key).toMatch(/^user_posts\/[0-9a-f-]{36}\.webp$/);
        const meta = await stored(key);
        expect(meta.format).toBe('webp');
        expect(meta.exif).toBeUndefined();
    });

    it('shrinks large images to 2048px on the longest side', async () => {
        const key = await saveImage(asUpload(await image(4000, 1000).png().toBuffer()), 'user_posts');
        const meta = await stored(key);
        expect([meta.width, meta.height]).toEqual([2048, 512]);
    });

    it('does not enlarge small images', async () => {
        const key = await saveImage(asUpload(await image(120, 90).png().toBuffer()), 'communities_images');
        const meta = await stored(key);
        expect([meta.width, meta.height]).toEqual([120, 90]);
    });

    it('crops avatars to a 512px square', async () => {
        const key = await saveImage(asUpload(await image(300, 900).png().toBuffer()), 'avatars');
        const meta = await stored(key);
        expect([meta.width, meta.height]).toEqual([512, 512]);
    });

    it('rejects data that is not an image', async () => {
        await expect(saveImage(asUpload(Buffer.from('not an image')), 'user_posts')).rejects.toMatchObject({
            status: 400,
            code: 'INVALID_FILE_TYPE',
        });
    });
});
