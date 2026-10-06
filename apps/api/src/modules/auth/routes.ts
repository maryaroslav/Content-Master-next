import type { Request, Response, Router } from 'express';
import { authEndpoints } from '@cm/contracts';
import type { User } from '../../models';
import { AppError } from '../../lib/errors';
import { currentUserId } from '../../middlewares/requireAuth';
import { twoFactorLoginRateLimit } from '../../middlewares/rateLimit';
import { signAccessToken } from '../../auth/tokens';
import { REFRESH_COOKIE, clearRefreshCookie, revokeRefreshToken, setRefreshCookie, startSession } from '../../auth/refreshTokens';
import { toUserDto } from '../users/mapper';
import { mount } from '../mount';
import * as authService from './service';

async function startSessionResponse(user: User, req: Request, res: Response) {
    setRefreshCookie(res, await startSession(user.user_id, req.get('user-agent')));
    return { accessToken: signAccessToken(user), user: toUserDto(user) };
}

export function mountAuthRoutes(router: Router): void {
    mount(router, authEndpoints.register, async ({ body }) => toUserDto(await authService.register(body)));

    mount(router, authEndpoints.login, async ({ body }, req, res) => {
        const result = await authService.login(body);
        if (result.status === 'twoFactorRequired') {
            return { twoFactorRequired: true as const, challengeToken: result.challengeToken };
        }
        return startSessionResponse(result.user, req, res);
    });

    mount(
        router,
        authEndpoints.twoFactorLogin,
        async ({ body }, req, res) => startSessionResponse(await authService.loginWithTwoFactor(body.challengeToken, body.code), req, res),
        { before: [twoFactorLoginRateLimit] }
    );

    mount(router, authEndpoints.refresh, async (_input, req, res) => {
        const current: unknown = req.cookies?.[REFRESH_COOKIE];
        if (typeof current !== 'string') {
            throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');
        }

        try {
            const { user, refreshToken } = await authService.refreshSession(current, req.get('user-agent'));
            setRefreshCookie(res, refreshToken);
            return { accessToken: signAccessToken(user), user: toUserDto(user) };
        } catch (err) {
            clearRefreshCookie(res);
            throw err;
        }
    });

    mount(router, authEndpoints.logout, async (_input, req, res) => {
        const current: unknown = req.cookies?.[REFRESH_COOKIE];
        if (typeof current === 'string') await revokeRefreshToken(current);
        clearRefreshCookie(res);
    });

    mount(router, authEndpoints.twoFactorSetup, async (_input, req) => ({
        qrCode: await authService.setupTwoFactor(currentUserId(req)),
    }));

    mount(router, authEndpoints.twoFactorEnable, async ({ body }, req) =>
        toUserDto(await authService.enableTwoFactor(currentUserId(req), body.code))
    );

    mount(router, authEndpoints.twoFactorDisable, async ({ body }, req) =>
        toUserDto(await authService.disableTwoFactor(currentUserId(req), body.code))
    );
}
