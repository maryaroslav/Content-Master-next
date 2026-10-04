import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';

import initializeSocket from './sockets';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import createCommunityRoutes from './routes/community';
import chatRoutes from './routes/chat';
import postRoutes from './routes/posts';
import followRoutes from './routes/follow';
import searchRoutes from './routes/search';

import { sequelize } from './models';
import { migrator } from './db/migrator';

const app = express();

const server = http.createServer(app);
initializeSocket(server);

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', createCommunityRoutes);
app.use('/api', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);

app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'), {
        setHeaders: (res) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
        },
    })
);

const PORT = Number(process.env.PORT ?? 5001);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('database connected');

        // The schema is managed by migrations only (src/db/migrations).
        const pending = await migrator.pending();
        if (pending.length > 0) {
            const names = pending.map((m) => m.name).join(', ');
            throw new Error(`Pending database migrations: ${names}. Run "pnpm --filter @cm/api db:migrate".`);
        }

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
