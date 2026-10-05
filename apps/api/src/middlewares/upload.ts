import multer from 'multer';
import { AppError } from '../lib/errors';

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

// Kept in memory: nothing reaches the disk until the request is validated and the image is re-encoded.
export const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    fileFilter: (_req, file, cb) => {
        if (ACCEPTED_MIME_TYPES.has(file.mimetype)) cb(null, true);
        else cb(new AppError(400, 'INVALID_FILE_TYPE', 'Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
    },
});
