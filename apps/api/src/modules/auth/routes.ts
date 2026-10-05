import { Router, type Request, type Response } from 'express';
import {
    LoginRequestSchema,
    RegisterRequestSchema,
    TwoFactorCodeRequestSchema,
    TwoFactorLoginRequestSchema,
} from '@cm/contracts';
import type { User } from '../../models';
import { AppError } from '../../lib/errors';
import { withValidation } from '../../middlewares/validate';
import { requireAuth, currentUserId } from '../../middlewares/requireAuth';
import { twoFactorLoginRateLimit } from '../../middlewares/rateLimit';
import { signAccessToken } from '../../auth/tokens';
import { REFRESH_COOKIE, clearRefreshCookie, revokeRefreshToken, setRefreshCookie, startSession } from '../../auth/refreshTokens';
import { toUserDto } from '../users/mapper';
import * as authService from './service';

const COOKIE_PATH = '/api/v1/auth';

const router = Router();

async function startSessionResponse(user: User, req: Request, res: Response) {
    setRefreshCookie(res, await startSession(user.user_id, req.get('user-agent')), COOKIE_PATH);
    return { accessToken: signAccessToken(user), user: toUserDto(user) };
}

router.post('/register', withValidation({ body: RegisterRequestSchema }, async ({ body }, _req, res) => {
    res.status(201).json(toUserDto(await authService.register(body)));
}));

router.post('/login', withValidation({ body: LoginRequestSchema }, async ({ body }, req, res) => {
    const result = await authService.login(body);
    if (result.status === 'twoFactorRequired') {
        res.json({ twoFactorRequired: true, challengeToken: result.challengeToken });
        return;
    }
    res.json(await startSessionResponse(result.user, req, res));
}));

router.post('/2fa/login', twoFactorLoginRateLimit, withValidation({ body: TwoFactorLoginRequestSchema }, async ({ body }, req, res) => {
    const user = await authService.loginWithTwoFactor(body.challengeToken, body.code);
    res.json(await startSessionResponse(user, req, res));
}));

router.post('/refresh', async (req, res) => {
    const current: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof current !== 'string') {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');
    }

    try {
        const { user, refreshToken } = await authService.refreshSession(current, req.get('user-agent'));
        setRefreshCookie(res, refreshToken, COOKIE_PATH);
        res.json({ accessToken: signAccessToken(user), user: toUserDto(user) });
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

router.post('/2fa/enable', requireAuth, withValidation({ body: TwoFactorCodeRequestSchema }, async ({ body }, req, res) => {
    const user = await authService.enableTwoFactor(currentUserId(req), body.code);
    if (!user) throw new AppError(401, 'INVALID_2FA_CODE', 'Invalid 2FA code');
    res.json(toUserDto(user));
}));

router.post('/2fa/disable', requireAuth, withValidation({ body: TwoFactorCodeRequestSchema }, async ({ body }, req, res) => {
    res.json(toUserDto(await authService.disableTwoFactor(currentUserId(req), body.code)));
}));

export default router;
