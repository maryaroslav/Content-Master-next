import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { imageFileFilter, extFromMime, IMAGE_MAX_SIZE } from './uploadPostImage';

function imageUpload(folder: string) {
    const dir = path.join(__dirname, '../../uploads', folder);
    fs.mkdirSync(dir, { recursive: true });

    return multer({
        storage: multer.diskStorage({
            destination: (_req, _file, cb) => cb(null, dir),
            filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extFromMime(file.mimetype)}`),
        }),
        limits: { fileSize: IMAGE_MAX_SIZE },
        fileFilter: imageFileFilter,
    });
}

export const chatImageUpload = imageUpload('chat_images');
export const communityPhotoUpload = imageUpload('communities_images');
