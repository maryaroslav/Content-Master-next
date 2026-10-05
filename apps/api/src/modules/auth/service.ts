import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { Op } from 'sequelize';
import type { LoginRequest, RegisterRequest } from '@cm/contracts';
import { User } from '../../models';
import { AppError } from '../../lib/errors';
import { signTwoFactorChallenge, verifyTwoFactorChallenge } from '../../auth/tokens';
import { decryptSecret, encryptSecret } from '../../auth/secretBox';
import { rotateRefreshToken } from '../../auth/refreshTokens';

// Compared against when the email is unknown, so both cases take the same time.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password', 10);

export type LoginResult =
    | { status: 'authenticated'; user: User }
    | { status: 'twoFactorRequired'; challengeToken: string };

const isValidCode = (encryptedSecret: string, code: string) =>
    speakeasy.totp.verify({ secret: decryptSecret(encryptedSecret), encoding: 'base32', token: code, window: 1 });

async function findUserOrThrow(userId: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
}

export async function register({ email, password, username }: RegisterRequest): Promise<User> {
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        throw new AppError(409, 'USER_EXISTS', `A user with this ${field} already exists`);
    }

    return User.create({ email, password_hash: await bcrypt.hash(password, 10), username });
}

export async function login({ email, password }: LoginRequest): Promise<LoginResult> {
    const user = await User.findOne({ where: { email } });
    const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_PASSWORD_HASH);
    if (!user || !passwordMatches) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (user.twoFactorEnabled) {
        return { status: 'twoFactorRequired', challengeToken: signTwoFactorChallenge(user.user_id) };
    }
    return { status: 'authenticated', user };
}

export async function loginWithTwoFactor(challengeToken: string, code: string): Promise<User> {
    const user = await User.findByPk(verifyTwoFactorChallenge(challengeToken));
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError(400, 'TWO_FACTOR_NOT_ENABLED', '2FA is not enabled for this user');
    }
    if (!isValidCode(user.twoFactorSecret, code)) {
        throw new AppError(401, 'INVALID_2FA_CODE', 'Invalid 2FA code');
    }
    return user;
}

export async function refreshSession(refreshToken: string, userAgent?: string): Promise<{ user: User; refreshToken: string }> {
    const rotated = await rotateRefreshToken(refreshToken, userAgent);
    const user = await User.findByPk(rotated.userId);
    if (!user) throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');
    return { user, refreshToken: rotated.token };
}

export async function setupTwoFactor(userId: number): Promise<string> {
    const user = await findUserOrThrow(userId);
    if (user.twoFactorEnabled) throw new AppError(409, 'TWO_FACTOR_ALREADY_ENABLED', '2FA is already enabled');

    const secret = speakeasy.generateSecret({ name: `Content-Master (${user.email})` });
    await user.update({ twoFactorSecret: encryptSecret(secret.base32) });
    return qrcode.toDataURL(secret.otpauth_url ?? '');
}

// Returns null for a wrong code: the legacy API answers that with `verified: false` instead of an error.
export async function enableTwoFactor(userId: number, code: string): Promise<User | null> {
    const user = await findUserOrThrow(userId);
    if (!user.twoFactorSecret) {
        throw new AppError(400, 'TWO_FACTOR_NOT_SET_UP', 'Start the 2FA setup first');
    }
    if (!isValidCode(user.twoFactorSecret, code)) return null;

    return user.update({ twoFactorEnabled: true });
}

export async function disableTwoFactor(userId: number, code: string): Promise<User> {
    const user = await findUserOrThrow(userId);
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError(400, 'TWO_FACTOR_NOT_ENABLED', '2FA is not enabled');
    }
    if (!isValidCode(user.twoFactorSecret, code)) {
        throw new AppError(401, 'INVALID_2FA_CODE', 'Invalid 2FA code');
    }
    return user.update({ twoFactorEnabled: false, twoFactorSecret: null });
}
