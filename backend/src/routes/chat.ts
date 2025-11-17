import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authToken from '../middlewares/authToken';
import db from '../models';
import { Op } from 'sequelize';

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
        cb(null, String(Date.now()) + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

const { User, Follow, Message } = db as any;

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

router.get('/following', authToken, async (req: Request, res: Response) => {
    try {
        const currentUserId = getReqUserId(req);
        if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

        const follows = await Follow.findAll({
            where: { follower_id: currentUserId },
            include: [
                {
                    model: User,
                    as: 'Following',
                    attributes: ['user_id', 'username', 'profile_picture'],
                    include: [
                        {
                            model: Message,
                            as: 'SentMessages',
                            where: { to_user_id: currentUserId },
                            required: false,
                            attributes: ['updated_at'],
                            limit: 1,
                            order: [['updated_at', 'DESC']],
                        },
                        {
                            model: Message,
                            as: 'ReceivedMessages',
                            where: { from_user_id: currentUserId },
                            required: false,
                            attributes: ['updated_at'],
                            limit: 1,
                            order: [['updated_at', 'DESC']],
                        },
                    ],
                },
            ],
        });

        const followedUsers = follows.map((f: any) => {
            const u = f.Following as any;
            const sent = u?.SentMessages?.[0]?.updated_at ?? null;
            const received = u?.ReceivedMessages?.[0]?.updated_at ?? null;
            const last = [sent, received].filter(Boolean).sort((a: Date, b: Date) => +new Date(b) - +new Date(a))[0] ?? null;

            return {
                user_id: u.user_id,
                username: u.username,
                profile_picture: u.profile_picture,
                last_message_time: last,
            };
        });

        followedUsers.sort((a, b) => {
            const ta = a.last_message_time ? +new Date(a.last_message_time) : 0;
            const tb = b.last_message_time ? +new Date(b.last_message_time) : 0;
            return tb - ta;
        });

        res.json(followedUsers);
    } catch (err) {
        console.error('[chat/following] Error: ', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/message/:userId', authToken, async (req: Request, res: Response) => {
    try {
        const fromId = getReqUserId(req);
        if (!fromId) return res.status(401).json({ message: 'Unauthorized' });

        const toId = parseInt(req.params.userId, 10);
        if (Number.isNaN(toId)) return res.status(400).json({ message: 'Invalid userId' });

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
        console.error('[chat/message] Error: ', err);
        res.status(500).json({ message: 'Failed to load messages' });
    }
});

router.post('/upload', authToken, upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: `/uploads/chat_images/${req.file.filename}` });
});

export default router;