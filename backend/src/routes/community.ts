import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authToken from '../middlewares/authToken';
import db from '../models';

const router = Router();
const { Community } = db as any;

const uploadDir = path.join(__dirname, '../../uploads/communities_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

function getReqUserId(req: Request): number | null {
    const u = (req as any).user;
    if (!u) return null;
    if (typeof u === 'string') {
        try {
            const parsed = JSON.parse(u);
            return parsed?.user_id ?? null;
        } catch {
            return null;
        }
    }
    return (u as any).user_id ?? null;
}

router.post('/createcommunity', authToken, upload.single('photo'), async (req: Request, res: Response) => {
    try {
        const { name, privacy, theme, description } = req.body;
        const photo = req.file;
        const owner_id = getReqUserId(req);

        console.log('uploadDir:', uploadDir);
        console.log('req.file:', req.file);

        if (!name || !privacy || !theme || !photo || !owner_id) {
            return res.status(400).json({ message: 'Name, privacy, theme, photo and authenticated owner are required' });
        }

        const newCommunity = await Community.create({
            name,
            privacy,
            theme,
            description: description ?? null,
            photo: photo.filename,
            owner_id,
        });

        return res.status(201).json({ message: 'Community created successfully', community: newCommunity });
    } catch (err: unknown) {
        console.error('Error creating community: ', err);
        return res.status(500).json({ message: 'Internal server error', error: (err as Error)?.message ?? String(err) });
    }
});

router.get('/mycommunities', authToken, async (req: Request, res: Response) => {
    try {
        const owner_id = getReqUserId(req);
        if (!owner_id) return res.status(401).json({ message: 'Unauthorized' });

        const communities = await Community.findAll({
            where: { owner_id },
        });

        return res.json(communities);
    } catch (err: unknown) {
        console.error('Error fetching communities: ', err);
        return res.status(500).json({ message: 'Internal server error', error: (err as Error)?.message ?? String(err) });
    }
});

export default router;