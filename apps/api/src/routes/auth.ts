import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { Op } from 'sequelize';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import {
    LoginRequestSchema,
    RegisterRequestSchema,
    TwoFactorCodeRequestSchema,
    TwoFactorLoginRequestSchema,
} from '@cm/contracts';
import { User } from '../models';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { toPublicUser } from '../utils/userDto';
import { withValidation } from '../middlewares/validate';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { signAccessToken, signTwoFactorChallenge, verifyTwoFactorChallenge } from '../auth/tokens';
import { decryptSecret, encryptSecret } from '../auth/secretBox';
import {
    REFRESH_COOKIE,
    clearRefreshCookie,
    revokeRefreshToken,
    rotateRefreshToken,
    setRefreshCookie,
    startSession,
} from '../auth/refreshTokens';

const router = Router();

// Compared against when the email is unknown, so both cases take the same time.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password', 10);

// Keyed by challenge: 5 code attempts per challenge, and a new challenge requires the password again.
const twoFactorLoginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: (req) =>
        typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : ipKeyGenerator(req.ip ?? ''),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, please log in again.' },
    skip: () => env.NODE_ENV === 'test',
});

const isValidCode = (encryptedSecret: string, token: string) =>
    speakeasy.totp.verify({ secret: decryptSecret(encryptedSecret), encoding: 'base32', token, window: 1 });

async function completeLogin(user: User, req: Request, res: Response) {
    setRefreshCookie(res, await startSession(user.user_id, req.get('user-agent')));
    return { token: signAccessToken(user), user: toPublicUser(user) };
}

router.post('/register', withValidation({ body: RegisterRequestSchema }, async ({ body }, _req, res) => {
    const { email, password, username } = body;

    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        throw new AppError(409, 'USER_EXISTS', `A user with this ${field} already exists`);
    }

    const user = await User.create({ email, password_hash: await bcrypt.hash(password, 10), username });
    res.status(201).json({ message: 'User created successfully', user: toPublicUser(user) });
}));

router.post('/login', withValidation({ body: LoginRequestSchema }, async ({ body }, req, res) => {
    const user = await User.findOne({ where: { email: body.email } });
    const passwordMatches = await bcrypt.compare(body.password, user?.password_hash ?? DUMMY_PASSWORD_HASH);
    if (!user || !passwordMatches) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (user.twoFactorEnabled) {
        res.json({ message: '2FA required', twofaRequired: true, challengeToken: signTwoFactorChallenge(user.user_id) });
        return;
    }

    res.json(await completeLogin(user, req, res));
}));

router.post('/2fa/verify-login', twoFactorLoginLimit, withValidation({ body: TwoFactorLoginRequestSchema }, async ({ body }, req, res) => {
    const user = await User.findByPk(verifyTwoFactorChallenge(body.challengeToken));
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError(400, 'TWO_FACTOR_NOT_ENABLED', '2FA is not enabled for this user');
    }
    if (!isValidCode(user.twoFactorSecret, body.token)) {
        throw new AppError(401, 'INVALID_2FA_CODE', 'Invalid 2FA code');
    }

    res.json({ message: '2FA verified', ...(await completeLogin(user, req, res)) });
}));

router.post('/refresh', async (req, res) => {
    const current: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof current !== 'string') {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');
    }

    try {
        const { userId, token } = await rotateRefreshToken(current, req.get('user-agent'));
        const user = await User.findByPk(userId);
        if (!user) throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');

        setRefreshCookie(res, token);
        res.json({ token: signAccessToken(user), user: toPublicUser(user) });
    } catch (err) {
        clearRefreshCookie(res);
        throw err;
    }
});

router.post('/logout', async (req, res) => {
    const current: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof current === 'string') await revokeRefreshToken(current);

    clearRefreshCookie(res);
    res.status(204).end();
});

router.post('/2fa/setup', requireAuth, async (req, res) => {
    const user = await User.findByPk(currentUserId(req));
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    if (user.twoFactorEnabled) throw new AppError(409, 'TWO_FACTOR_ALREADY_ENABLED', '2FA is already enabled');

    const secret = speakeasy.generateSecret({ name: `Content-Master (${user.email})` });
    await user.update({ twoFactorSecret: encryptSecret(secret.base32) });

    res.json({ qrCode: await qrcode.toDataURL(secret.otpauth_url ?? '') });
});

router.post('/2fa/verify', requireAuth, withValidation({ body: TwoFactorCodeRequestSchema }, async ({ body }, req, res) => {
    const user = await User.findByPk(currentUserId(req));
    if (!user?.twoFactorSecret) {
        throw new AppError(400, 'TWO_FACTOR_NOT_SET_UP', 'Start the 2FA setup first');
    }
    if (!isValidCode(user.twoFactorSecret, body.token)) {
        res.json({ verified: false });
        return;
    }

    await user.update({ twoFactorEnabled: true });
    res.json({ verified: true, token: signAccessToken(user) });
}));

router.post('/2fa/disable', requireAuth, withValidation({ body: TwoFactorCodeRequestSchema }, async ({ body }, req, res) => {
    const user = await User.findByPk(currentUserId(req));
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError(400, 'TWO_FACTOR_NOT_ENABLED', '2FA is not enabled');
    }
    if (!isValidCode(user.twoFactorSecret, body.token)) {
        throw new AppError(401, 'INVALID_2FA_CODE', 'Invalid 2FA code');
    }

    await user.update({ twoFactorEnabled: false, twoFactorSecret: null });
    res.json({ message: '2FA disabled successfully' });
}));

export default router;
