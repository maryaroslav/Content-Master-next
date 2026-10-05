import { Router, type Request, type Response } from 'express';
import {
    LoginRequestSchema,
    RegisterRequestSchema,
    TwoFactorCodeRequestSchema,
    TwoFactorLoginRequestSchema,
} from '@cm/contracts/legacy';
import type { User } from '../models';
import { AppError } from '../lib/errors';
import { toPublicUser } from '../utils/userDto';
import { withValidation } from '../middlewares/validate';
import { requireAuth, currentUserId } from '../middlewares/requireAuth';
import { twoFactorLoginRateLimit } from '../middlewares/rateLimit';
import { signAccessToken } from '../auth/tokens';
import { REFRESH_COOKIE, clearRefreshCookie, revokeRefreshToken, setRefreshCookie, startSession } from '../auth/refreshTokens';
import * as authService from '../modules/auth/service';

const COOKIE_PATH = '/api/auth';

const router = Router();

async function startLegacySession(user: User, req: Request, res: Response) {
    setRefreshCookie(res, await startSession(user.user_id, req.get('user-agent')), COOKIE_PATH);
    return { token: signAccessToken(user), user: toPublicUser(user) };
}

router.post('/register', withValidation({ body: RegisterRequestSchema }, async ({ body }, _req, res) => {
    const user = await authService.register(body);
    res.status(201).json({ message: 'User created successfully', user: toPublicUser(user) });
}));

router.post('/login', withValidation({ body: LoginRequestSchema }, async ({ body }, req, res) => {
    const result = await authService.login(body);
    if (result.status === 'twoFactorRequired') {
        res.json({ message: '2FA required', twofaRequired: true, challengeToken: result.challengeToken });
        return;
    }
    res.json(await startLegacySession(result.user, req, res));
}));

router.post('/2fa/verify-login', twoFactorLoginRateLimit, withValidation({ body: TwoFactorLoginRequestSchema }, async ({ body }, req, res) => {
    const user = await authService.loginWithTwoFactor(body.challengeToken, body.token);
    res.json({ message: '2FA verified', ...(await startLegacySession(user, req, res)) });
}));

router.post('/refresh', async (req, res) => {
    const current: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof current !== 'string') {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');
    }

    try {
        const { user, refreshToken } = await authService.refreshSession(current, req.get('user-agent'));
        setRefreshCookie(res, refreshToken, COOKIE_PATH);
        res.json({ token: signAccessToken(user), user: toPublicUser(user) });
    } catch (err) {
        clearRefreshCookie(res, COOKIE_PATH);
        throw err;
    }
});

router.post('/logout', async (req, res) => {
    const current: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof current === 'string') await revokeRefreshToken(current);

    clearRefreshCookie(res, COOKIE_PATH);
    res.status(204).end();
});

router.post('/2fa/setup', requireAuth, async (req, res) => {
    res.json({ qrCode: await authService.setupTwoFactor(currentUserId(req)) });
});

router.post('/2fa/verify', requireAuth, withValidation({ body: TwoFactorCodeRequestSchema }, async ({ body }, req, res) => {
    const user = await authService.enableTwoFactor(currentUserId(req), body.token);
    res.json(user ? { verified: true, token: signAccessToken(user) } : { verified: false });
}));

router.post('/2fa/disable', requireAuth, withValidation({ body: TwoFactorCodeRequestSchema }, async ({ body }, req, res) => {
    await authService.disableTwoFactor(currentUserId(req), body.token);
    res.json({ message: '2FA disabled successfully' });
}));

export default router;
