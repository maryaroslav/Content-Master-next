import { migrator } from './migrator';
import sequelize from '../config/db';

// Usage: `pnpm db:migrate`, `pnpm db:rollback`, `pnpm db:status` (see package.json).
migrator
    .runAsCLI()
    .finally(() => sequelize.close())
    .then((success) => process.exit(success ? 0 : 1));
