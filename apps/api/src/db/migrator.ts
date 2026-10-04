import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from '../config/db';
import { logger } from '../lib/logger';

/**
 * Migrations live in `src/db/migrations` (compiled to `dist/db/migrations`) and run in file name order.
 * Applied migrations are recorded in the `SequelizeMeta` table by name without the extension,
 * so `.ts` (dev) and compiled `.js` (production) files are treated as the same migration.
 */
export const migrator = new Umzug({
    migrations: {
        glob: ['migrations/*.{js,ts}', { cwd: __dirname, ignore: ['**/*.d.ts'] }],
        resolve: (params) => ({
            ...Umzug.defaultResolver(params),
            name: params.name.replace(/\.(js|ts)$/, ''),
        }),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, modelName: 'SequelizeMeta' }),
    logger: logger.child({ component: 'migrations' }),
});

export type Migration = typeof migrator._types.migration;
