import dotenv from 'dotenv';
import { Sequelize, Dialect } from 'sequelize';

dotenv.config({ path: '.env' });

const { DB_NAME, DB_USER, DB_PASS, DB_HOST } = process.env;
if (!DB_NAME || !DB_USER || DB_HOST == null) {
    throw new Error('Database environment variables DB_NAME, DB_USER and DB_HOST must be set');
}

const dialect: Dialect = 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS ?? '', {
    host: DB_HOST,
    dialect,
    logging: false,
});

export default sequelize;