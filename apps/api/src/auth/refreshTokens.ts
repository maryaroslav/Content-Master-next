import crypto from 'crypto';
import type { Response } from 'express';
import { Op } from 'sequelize';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { RefreshToken } from '../models';

export const REFRESH_COOKIE = 'cm_refresh';

const ttlMs = () => env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

// Only the hash is stored, so a database leak does not expose usable tokens.
const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

async function issue(userId: number, familyId: string, userAgent?: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('base64url');
    await RefreshToken.create({
        user_id: userId,
        token_hash: hash(token),
        family_id: familyId,
        expires_at: new Date(Date.now() + ttlMs()),
        user_agent: userAgent?.slice(0, 255) ?? null,
    });
    return token;
}

export function startSession(userId: number, userAgent?: string): Promise<string> {
    return issue(userId, crypto.randomUUID(), userAgent);
}

export async function rotateRefreshToken(token: string, userAgent?: string): Promise<{ userId: number; token: string }> {
    const invalid = new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');

    const stored = await RefreshToken.findOne({ where: { token_hash: hash(token) } });
    if (!stored) throw invalid;

    if (stored.revoked_at) {
        // A rotated token was used again: it may have been stolen, so end the whole session.
        await revokeFamily(stored.family_id);
        logger.warn({ userId: stored.user_id }, 'Refresh token reuse detected, session revoked');
        throw invalid;
    }
    if (stored.expires_at.getTime() <= Date.now()) throw invalid;

    await stored.update({ revoked_at: new Date() });
    const next = await issue(stored.user_id, stored.family_id, userAgent);
    return { userId: stored.user_id, token: next };
}

export async function revokeRefreshToken(token: string): Promise<void> {
    const stored = await RefreshToken.findOne({ where: { token_hash: hash(token) } });
    if (stored) await revokeFamily(stored.family_id);
}

async function revokeFamily(familyId: string): Promise<void> {
    await RefreshToken.update({ revoked_at: new Date() }, { where: { family_id: familyId, revoked_at: { [Op.is]: null } } });
}

const REFRESH_COOKIE_PATH = '/api/v1/auth';

export function setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: REFRESH_COOKIE_PATH,
        maxAge: ttlMs(),
    });
}

export function clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
}
