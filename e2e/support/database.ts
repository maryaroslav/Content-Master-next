import mysql from 'mysql2/promise';
import { database } from './settings';

async function admin<T>(run: (connection: mysql.Connection) => Promise<T>): Promise<T> {
    const connection = await mysql.createConnection({
        host: database.host,
        port: database.port,
        user: database.user,
        password: database.password,
    });
    try {
        return await run(connection);
    } finally {
        await connection.end();
    }
}

export const createDatabase = () => admin((c) => c.query(`CREATE DATABASE \`${database.name}\``));
export const dropDatabase = () => admin((c) => c.query(`DROP DATABASE IF EXISTS \`${database.name}\``));
