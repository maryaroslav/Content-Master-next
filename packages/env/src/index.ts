import { z } from 'zod';

// Everything in this schema is sent to the browser: never add secrets here.
const publicEnvSchema = z.object({
    // Base URL of API v1 as seen by the browser: same-origin path through the Next rewrite or the gateway.
    API_URL: z.string().min(1).default('/api/v1'),
    APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const serverEnvSchema = z.object({
    // Where the Express API runs; used by the Next rewrites and by server-side requests.
    API_ORIGIN: z.url().default('http://localhost:5001'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

declare global {
    interface Window {
        __ENV__?: unknown;
    }
}

function parse<T extends z.ZodType>(schema: T, source: unknown, origin: string): z.output<T> {
    const result = schema.safeParse(source ?? {});
    if (!result.success) throw new Error(`Invalid environment (${origin}):\n${z.prettifyError(result.error)}`);
    return result.data;
}

// In the browser the values come from /env.js, so one build runs in every environment.
export function publicEnv(): PublicEnv {
    if (typeof window !== 'undefined') return parse(publicEnvSchema, window.__ENV__, 'window.__ENV__ from /env.js');
    return parse(publicEnvSchema, process.env, 'process.env');
}

export function serverEnv(): ServerEnv {
    if (typeof window !== 'undefined') throw new Error('serverEnv() must not be used in the browser');
    return parse(serverEnvSchema, process.env, 'process.env');
}

export function renderPublicEnvScript(env: PublicEnv = publicEnv()): string {
    return `window.__ENV__ = ${JSON.stringify(env)};\n`;
}
