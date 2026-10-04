import http from 'http';

import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import initializeSocket from './sockets';
import { sequelize } from './models';
import { migrator } from './db/migrator';

const server = http.createServer(app);
const io = initializeSocket(server);

const start = async () => {
    await sequelize.authenticate();
    logger.info('Database connected');

    // The schema is managed by migrations only (src/db/migrations).
    const pending = await migrator.pending();
    if (pending.length > 0) {
        const names = pending.map((m) => m.name).join(', ');
        throw new Error(`Pending database migrations: ${names}. Run "pnpm --filter @cm/api db:migrate".`);
    }

    server.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`);
    });
};

const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Shutting down');
    // Force exit if open connections keep the server alive for too long.
    setTimeout(() => process.exit(1), 10_000).unref();
    // Closes Socket.IO connections and the underlying HTTP server.
    io.close(() => {
        sequelize.close().finally(() => process.exit(0));
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start().catch((err: unknown) => {
    logger.fatal({ err }, 'Failed to start the server');
    process.exit(1);
});
