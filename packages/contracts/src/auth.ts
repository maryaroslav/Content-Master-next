import { z } from 'zod';
import { PublicUserSchema, UsernameSchema } from './user';

export const TotpCodeSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'The code must consist of 6 digits');

export const RegisterRequestSchema = z.object({
    email: z.email('Please enter a valid email').max(255),
    // bcrypt only uses the first 72 bytes of a password.
    password: z.string().min(8, 'Password must be at least 8 characters long').max(72),
    username: UsernameSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
    message: z.string(),
    user: PublicUserSchema,
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LoginRequestSchema = z.object({
    email: z.string().trim().min(1, 'Email is required').max(255),
    password: z.string().min(1, 'Password is required').max(72),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthTokenResponseSchema = z.object({
    token: z.string(),
    user: PublicUserSchema,
});
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;

export const TwoFactorRequiredResponseSchema = z.object({
    message: z.string(),
    twofaRequired: z.literal(true),
    challengeToken: z.string(),
});
export type TwoFactorRequiredResponse = z.infer<typeof TwoFactorRequiredResponseSchema>;

export const LoginResponseSchema = z.union([AuthTokenResponseSchema, TwoFactorRequiredResponseSchema]);
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const TwoFactorLoginRequestSchema = z.object({
    challengeToken: z.string().min(1),
    token: TotpCodeSchema,
});
export type TwoFactorLoginRequest = z.infer<typeof TwoFactorLoginRequestSchema>;

export const TwoFactorLoginResponseSchema = AuthTokenResponseSchema.extend({
    message: z.string(),
});
export type TwoFactorLoginResponse = z.infer<typeof TwoFactorLoginResponseSchema>;

export const TwoFactorSetupResponseSchema = z.object({
    qrCode: z.string(),
});
export type TwoFactorSetupResponse = z.infer<typeof TwoFactorSetupResponseSchema>;

// Enabling and disabling 2FA both require a current code from the authenticator app.
export const TwoFactorCodeRequestSchema = z.object({
    token: TotpCodeSchema,
});
export type TwoFactorCodeRequest = z.infer<typeof TwoFactorCodeRequestSchema>;

export const TwoFactorVerifyResponseSchema = z.object({
    verified: z.boolean(),
    token: z.string().optional(),
});
export type TwoFactorVerifyResponse = z.infer<typeof TwoFactorVerifyResponseSchema>;

export const RefreshResponseSchema = AuthTokenResponseSchema;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

export const MessageResponseSchema = z.object({
    message: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
