import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../../src/config/env';
import {
    signAccessToken,
    signTwoFactorChallenge,
    verifyAccessToken,
    verifyTwoFactorChallenge,
} from '../../src/auth/tokens';

const user = { user_id: 42, email: 'alice@example.com' };

describe('tokens', () => {
    it('verifies an access token', () => {
        expect(verifyAccessToken(signAccessToken(user))).toEqual({ userId: 42, email: 'alice@example.com' });
    });

    it('verifies a 2FA challenge', () => {
        expect(verifyTwoFactorChallenge(signTwoFactorChallenge(42))).toBe(42);
    });

    it('does not accept a 2FA challenge as an access token', () => {
        expect(() => verifyAccessToken(signTwoFactorChallenge(42))).toThrow(expect.objectContaining({ status: 401 }));
    });

    it('does not accept an access token as a 2FA challenge', () => {
        expect(() => verifyTwoFactorChallenge(signAccessToken(user))).toThrow(expect.objectContaining({ status: 401 }));
    });

    it('rejects an expired token', () => {
        const expired = jwt.sign({ type: 'access', email: user.email }, env.JWT_SECRET, { subject: '42', expiresIn: -10 });
        expect(() => verifyAccessToken(expired)).toThrow(expect.objectContaining({ code: 'INVALID_TOKEN' }));
    });

    it('rejects a token signed with another key', () => {
        const forged = jwt.sign({ type: 'access', email: user.email }, 'some-other-secret-of-sufficient-length', { subject: '42' });
        expect(() => verifyAccessToken(forged)).toThrow(expect.objectContaining({ code: 'INVALID_TOKEN' }));
    });

    it('rejects garbage', () => {
        expect(() => verifyAccessToken('not-a-token')).toThrow(expect.objectContaining({ status: 401 }));
    });
});
