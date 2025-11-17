import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from 'express';

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
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    console.log('[UPLOAD DEBUG] mimetype:', file.mimetype);
    console.log('[UPLOAD DEBUG] originalname:', file.originalname);

    const mimetypeOk = allowedTypes.includes(file.mimetype);
    const extOk = allowedExt.includes(path.extname(file.originalname).toLowerCase());

    if (mimetypeOk || extOk) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

export default upload;