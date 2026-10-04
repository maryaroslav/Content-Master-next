import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from 'express';
import { AppError } from '../lib/errors';

const uploadPath = path.join(__dirname, '../../uploads/user_posts');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + extFromMime(file.mimetype));
    }
});

const extByMime: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
};
const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const extFromMime = (mimetype: string): string => extByMime[mimetype] ?? '';

export const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const mimetypeOk = file.mimetype in extByMime;
    const extOk = allowedExt.includes(path.extname(file.originalname).toLowerCase());

    if (mimetypeOk && extOk) {
        cb(null, true);
    } else {
        cb(new AppError(400, 'INVALID_FILE_TYPE', 'Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: IMAGE_MAX_SIZE },
    fileFilter: imageFileFilter
});

export default upload;