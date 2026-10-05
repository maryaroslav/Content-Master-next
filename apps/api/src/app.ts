import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';

import { env } from './config/env';
import { logger } from './lib/logger';
import { apiRateLimit, authRateLimit } from './middlewares/rateLimit';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { UPLOAD_ROOT, UPLOAD_URL_PREFIX } from './storage/storage';

import v1Routes from './modules/v1';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import createCommunityRoutes from './routes/community';
import chatRoutes from './routes/chat';
import postRoutes from './routes/posts';
import followRoutes from './routes/follow';
import searchRoutes from './routes/search';

export const app = express();

app.use(
    pinoHttp({
        logger,
        customLogLevel: (_req, res, err) => {
            if (err || res.statusCode >= 500) return 'error';
            if (res.statusCode >= 400) return 'warn';
            return 'info';
        },
        autoLogging: { ignore: (req) => req.url?.startsWith(UPLOAD_URL_PREFIX) ?? false },
        customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
        customErrorMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
        serializers: {
            req: (req: { id: string | number; method: string; url: string }) => ({ id: req.id, method: req.method, url: req.url }),
            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
        },
    })
);

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

app.use(
    cors({
        origin: env.CORS_ORIGINS,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

app.use('/api', apiRateLimit);
app.use('/api/v1', v1Routes);
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', createCommunityRoutes);
app.use('/api', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);

app.use(
    UPLOAD_URL_PREFIX,
    express.static(UPLOAD_ROOT, {
        setHeaders: (res) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
        },
    })
);

app.use(notFoundHandler);
app.use(errorHandler);
