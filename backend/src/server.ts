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

import db from './models';

const app = express();

console.log('[BACKEND] JWT_SECRET:', process.env.JWT_SECRET);

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

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = Number(process.env.PORT ?? 5000);

const startServer = async () => {
    try {
        await db.sequelize.sync();
        console.log('database connected');

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
