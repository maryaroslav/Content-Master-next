import { z } from 'zod';
import { PublicUserSchema } from './user';
import { LoginRequestSchema, RegisterRequestSchema, TotpCodeSchema, type LoginRequest, type RegisterRequest } from '../auth';

export { LoginRequestSchema, RegisterRequestSchema, TotpCodeSchema, type LoginRequest, type RegisterRequest };

export const RegisterResponseSchema = z.object({
    message: z.string(),
    user: PublicUserSchema,
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

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

export const MessageResponseSchema = z.object({
    message: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
