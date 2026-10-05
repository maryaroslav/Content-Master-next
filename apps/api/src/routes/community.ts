import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { imageFileFilter, extFromMime, IMAGE_MAX_SIZE } from '../middlewares/uploadPostImage';
import { Community } from '../models';
import { CreateCommunityRequestSchema } from '@cm/contracts';
import { logger } from '../lib/logger';
import { withValidation } from '../middlewares/validate';

const router = Router();

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
        cb(null, uniqueSuffix + extFromMime(file.mimetype));
    },
});

const upload = multer({ storage, limits: { fileSize: IMAGE_MAX_SIZE }, fileFilter: imageFileFilter });

router.post('/createcommunity', requireAuth, upload.single('photo'), withValidation({ body: CreateCommunityRequestSchema }, async ({ body }, req, res) => {
    try {
        const { name, privacy, theme, description } = body;
        const photo = req.file;
        const owner_id = currentUserId(req);
        if (!photo) {
            return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Community photo is required' });
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
        logger.error({ err }, 'Error creating community');
        return res.status(500).json({ message: 'Internal server error', error: (err as Error)?.message ?? String(err) });
    }
}));

router.get('/mycommunities', requireAuth, async (req: Request, res: Response) => {
    try {
        const owner_id = currentUserId(req);

        const communities = await Community.findAll({
            where: { owner_id },
        });

        return res.json(communities);
    } catch (err: unknown) {
        logger.error({ err }, 'Error fetching communities');
        return res.status(500).json({ message: 'Internal server error', error: (err as Error)?.message ?? String(err) });
    }
});

export default router;