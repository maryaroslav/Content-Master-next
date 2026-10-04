import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
    level: env.LOG_LEVEL,
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        censor: '[redacted]',
    },
    transport:
        env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } }
            : undefined,
});
