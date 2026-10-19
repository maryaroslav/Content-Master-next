import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

export interface AccessTokenPayload {
    userId: number;
    email: string;
    expiresAt: number;
}

type TokenType = 'access' | '2fa_challenge';

function sign(type: TokenType, userId: number, claims: object, expiresIn: SignOptions['expiresIn']) {
    return jwt.sign({ ...claims, type }, env.JWT_SECRET, { subject: String(userId), expiresIn });
}

function verify(type: TokenType, token: string): jwt.JwtPayload {
    let payload: string | jwt.JwtPayload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
        throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }
    if (typeof payload === 'string' || payload.type !== type || !payload.sub) {
        throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }
    return payload;
}

export function signAccessToken(user: { user_id: number; email: string }): string {
    return sign('access', user.user_id, { email: user.email }, env.ACCESS_TOKEN_TTL as SignOptions['expiresIn']);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const payload = verify('access', token);
    return { userId: Number(payload.sub), email: String(payload.email), expiresAt: (payload.exp ?? 0) * 1000 };
}

export function signTwoFactorChallenge(userId: number): string {
    return sign('2fa_challenge', userId, {}, '5m');
}

export function verifyTwoFactorChallenge(token: string): number {
    return Number(verify('2fa_challenge', token).sub);
}
