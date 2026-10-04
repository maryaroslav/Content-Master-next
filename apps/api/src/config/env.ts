import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5001),

    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASS: z.string().default(''),

    JWT_SECRET: z.string().min(32, 'must be at least 32 characters long'),

    /** Comma-separated list of frontend origins allowed by CORS and Socket.IO. */
    CORS_ORIGINS: z
        .string()
        .default('http://localhost:3000')
        .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean))
        .pipe(z.array(z.url()).min(1)),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        throw new Error(`Invalid environment variables (apps/api/.env):\n${z.prettifyError(result.error)}`);
    }
    return result.data;
}

/** Validated environment. Import this instead of reading `process.env` directly. */
export const env = loadEnv();
