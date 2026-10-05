import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { imageFileFilter, extFromMime, IMAGE_MAX_SIZE } from '../middlewares/uploadPostImage';
import { User, Follow, Message } from '../models';
import { Op } from 'sequelize';
import { UserIdParamsSchema } from '@cm/contracts';
import { logger } from '../lib/logger';
import { withValidation } from '../middlewares/validate';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads/chat_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + extFromMime(file.mimetype));
    },
});
const upload = multer({ storage, limits: { fileSize: IMAGE_MAX_SIZE }, fileFilter: imageFileFilter });

interface FollowedUser {
    user_id: number;
    username: string;
    profile_picture: string | null;
    last_message_time: Date | null;
}

router.get('/following', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = currentUserId(req);

        const follows = await Follow.findAll({
            where: { follower_id: userId },
            include: [
                {
                    model: User,
                    as: 'Following',
                    attributes: ['user_id', 'username', 'profile_picture'],
                    include: [
                        {
                            model: Message,
                            as: 'SentMessages',
                            where: { to_user_id: userId },
                            required: false,
                            attributes: ['updated_at'],
                            limit: 1,
                            order: [['updated_at', 'DESC']],
                        },
                        {
                            model: Message,
                            as: 'ReceivedMessages',
                            where: { from_user_id: userId },
                            required: false,
                            attributes: ['updated_at'],
                            limit: 1,
                            order: [['updated_at', 'DESC']],
                        },
                    ],
                },
            ],
        });

        const followedUsers = follows.flatMap((f): FollowedUser[] => {
            const u = f.Following;
            if (!u) return [];

            const last = [u.SentMessages?.[0]?.updated_at, u.ReceivedMessages?.[0]?.updated_at]
                .filter((time): time is Date => time != null)
                .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? null;

            return [{
                user_id: u.user_id,
                username: u.username,
                profile_picture: u.profile_picture,
                last_message_time: last,
            }];
        });

        followedUsers.sort((a, b) => {
            const ta = a.last_message_time ? +new Date(a.last_message_time) : 0;
            const tb = b.last_message_time ? +new Date(b.last_message_time) : 0;
            return tb - ta;
        });

        res.json(followedUsers);
    } catch (err) {
        logger.error({ err }, '[chat/following] Error');
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/message/:userId', requireAuth, withValidation({ params: UserIdParamsSchema }, async ({ params }, req, res) => {
    try {
        const fromId = currentUserId(req);

        const toId = params.userId;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { from_user_id: fromId, to_user_id: toId },
                    { from_user_id: toId, to_user_id: fromId },
                ],
            },
            include: [
                {
                    model: User,
                    as: 'FromUser',
                    attributes: ['user_id', 'username', 'profile_picture'],
                },
            ],
            order: [['created_at', 'ASC']],
        });

        res.json(messages);
    } catch (err) {
        logger.error({ err }, '[chat/message] Error');
        res.status(500).json({ message: 'Failed to load messages' });
    }
}));

router.post('/upload', requireAuth, upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: `/uploads/chat_images/${req.file.filename}` });
});

export default router;