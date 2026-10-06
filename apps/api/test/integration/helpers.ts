import request from 'supertest';
import sharp from 'sharp';
import { app } from '../../src/app';
import { sequelize } from '../../src/models';

export const api = () => request(app);

export async function resetDatabase(): Promise<void> {
    const tables = (await sequelize.getQueryInterface().showAllTables()).filter((table) => table !== 'SequelizeMeta');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) await sequelize.query(`TRUNCATE TABLE \`${table}\``);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
}

export interface TestUser {
    id: number;
    username: string;
    email: string;
    password: string;
    accessToken: string;
    auth: { Authorization: string };
}

export async function createUser(username: string): Promise<TestUser> {
    const email = `${username}@example.com`;
    const password = 'password123';

    const registered = await api().post('/api/v1/auth/register').send({ email, password, username }).expect(201);
    const login = await api().post('/api/v1/auth/login').send({ email, password }).expect(200);

    return {
        id: registered.body.id,
        username,
        email,
        password,
        accessToken: login.body.accessToken,
        auth: { Authorization: `Bearer ${login.body.accessToken}` },
    };
}

export const testImage = (width = 64, height = 64) =>
    sharp({ create: { width, height, channels: 3, background: { r: 10, g: 120, b: 200 } } }).png().toBuffer();
