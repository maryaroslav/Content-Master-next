import { z } from 'zod';
import { UserSchema, UsernameSchema } from './user';

export const TotpCodeSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'The code must consist of 6 digits');

export const RegisterRequestSchema = z.object({
    email: z.email('Please enter a valid email').max(255),
    // bcrypt only uses the first 72 bytes of a password.
    password: z.string().min(8, 'Password must be at least 8 characters long').max(72),
    username: UsernameSchema,
}).meta({ id: 'RegisterRequest' });
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
    email: z.string().trim().min(1, 'Email is required').max(255),
    password: z.string().min(1, 'Password is required').max(72),
}).meta({ id: 'LoginRequest' });
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthSessionSchema = z.object({
    accessToken: z.string(),
    user: UserSchema,
}).meta({ id: 'AuthSession' });
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const TwoFactorChallengeSchema = z.object({
    twoFactorRequired: z.literal(true),
    challengeToken: z.string(),
}).meta({ id: 'TwoFactorChallenge' });
export type TwoFactorChallenge = z.infer<typeof TwoFactorChallengeSchema>;

export const LoginResponseSchema = z.union([AuthSessionSchema, TwoFactorChallengeSchema]);
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const TwoFactorLoginRequestSchema = z.object({
    challengeToken: z.string().min(1),
    code: TotpCodeSchema,
}).meta({ id: 'TwoFactorLoginRequest' });
export type TwoFactorLoginRequest = z.infer<typeof TwoFactorLoginRequestSchema>;

export const TwoFactorCodeRequestSchema = z.object({
    code: TotpCodeSchema,
}).meta({ id: 'TwoFactorCodeRequest' });
export type TwoFactorCodeRequest = z.infer<typeof TwoFactorCodeRequestSchema>;

export const TwoFactorSetupResponseSchema = z.object({
    qrCode: z.string(),
}).meta({ id: 'TwoFactorSetupResponse' });
export type TwoFactorSetupResponse = z.infer<typeof TwoFactorSetupResponseSchema>;
