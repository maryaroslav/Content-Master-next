import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import authToken from '../middlewares/authToken';
import { User } from '../models';
import { env } from '../config/env';
import { toPublicUser } from '../utils/userDto';
import { Op } from 'sequelize';
import {
    LoginRequestSchema,
    RegisterRequestSchema,
    TwoFactorLoginRequestSchema,
    TwoFactorVerifyRequestSchema,
} from '@cm/contracts';
import { logger } from '../lib/logger';
import { withValidation } from '../middlewares/validate';

const router = Router();

const signToken = (user: { user_id: number; email: string }) =>
    jwt.sign({ user_id: user.user_id, email: user.email }, env.JWT_SECRET, { expiresIn: '1h' });

function getReqUser(req: Request): { user_id?: number; email?: string } {
    const u = (req as any).user;
    if (!u) return {};
    if (typeof u === 'string') {
        try {
            return JSON.parse(u);
        } catch {
            return {};
        }
    }
    return u as any;
}

router.post('/register', withValidation({ body: RegisterRequestSchema }, async ({ body }, _req, res) => {
    try {
        const { email, password, username } = body;

        const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(409).json({ code: 'USER_EXISTS', message: `A user with this ${field} already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ email, password_hash: hashedPassword, username });

        res.status(201).json({ message: 'User created successfully', user: toPublicUser(user) });
    } catch (err) {
        logger.error({ err }, 'Error during registration');
        res.status(500).json({ message: 'Error creating user' });
    }
}));

router.post('/login', withValidation({ body: LoginRequestSchema }, async ({ body }, _req, res) => {
    try {
        const { email, password } = body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.twoFactorEnabled) {
            return res.status(200).json({
                message: '2FA required',
                twofaRequired: true,
                userId: user.user_id,
            });
        }

        res.json({ token: signToken(user), user: toPublicUser(user) });
    } catch (err) {
        logger.error({ err }, '[auth] Request failed');
        res.status(500).json({ message: 'Error logging in' });
    }
}));

router.post('/2fa/verify-login', withValidation({ body: TwoFactorLoginRequestSchema }, async ({ body }, _req, res) => {
    try {
        const { userId, token } = body;
        const user = await User.findByPk(userId);

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ message: '2FA not enabled for user' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });

        if (!verified) {
            return res.status(401).json({ message: 'Invalid 2FA token' });
        }

        res.json({ message: '2FA verified', token: signToken(user), user: toPublicUser(user) });
    } catch (err) {
        logger.error({ err }, '[auth] Request failed');
        res.status(500).json({ message: 'Error verifying 2FA token' });
    }
}));

router.post('/2fa/setup', authToken, async (req: Request, res: Response) => {
    try {
        const { user_id } = getReqUser(req);
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const secret = speakeasy.generateSecret({
            name: `Content-Master (${user.email})`,
        });

        await user.update({ twoFactorSecret: secret.base32 });

        const qrCode = await qrcode.toDataURL(secret.otpauth_url || '');
        res.json({ qrCode });
    } catch (err) {
        logger.error({ err }, '[auth] Request failed');
        res.status(500).json({ message: 'Error generating 2FA secret' });
    }
});

router.post('/2fa/disable', authToken, async (req: Request, res: Response) => {
    try {
        const { user_id } = getReqUser(req);
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({
            twoFactorEnabled: false,
            twoFactorSecret: null,
        });

        res.json({ message: '2FA disabled successfully' });
    } catch (err) {
        logger.error({ err }, '[auth] Request failed');
        res.status(500).json({ message: 'Error disabling 2FA' });
    }
});

router.post('/2fa/verify', authToken, withValidation({ body: TwoFactorVerifyRequestSchema }, async ({ body }, req, res) => {
    try {
        const { user_id } = getReqUser(req);
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

        const { token } = body;
        const user = await User.findByPk(user_id);

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: 'User or secret not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });

        if (verified) {
            await user.update({ twoFactorEnabled: true });

            return res.json({ verified: true, token: signToken(user) });
        }
        res.json({ verified });
    } catch (err) {
        logger.error({ err }, '[auth] Request failed');
        res.status(500).json({ message: 'Error verifying 2FA token' });
    }
}));

export default router;