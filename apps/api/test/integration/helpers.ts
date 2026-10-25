import fs from 'fs/promises';
import path from 'path';
import request, { type Response } from 'supertest';
import sharp from 'sharp';
import speakeasy from 'speakeasy';
import { app } from '../../src/app';
import { sequelize, User } from '../../src/models';
import { decryptSecret } from '../../src/auth/secretBox';
import { UPLOAD_ROOT, UPLOAD_URL_PREFIX } from '../../src/storage/storage';

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

export async function totpFor(userId: number): Promise<string> {
    const user = await User.findByPk(userId);
    return speakeasy.totp({ secret: decryptSecret(user!.twoFactorSecret!), encoding: 'base32' });
}

export async function enableTwoFactor(user: TestUser): Promise<void> {
    await api().post('/api/v1/auth/2fa/setup').set(user.auth).expect(200);
    await api().post('/api/v1/auth/2fa/enable').set(user.auth).send({ code: await totpFor(user.id) }).expect(200);
}

export function refreshCookie(res: Response): string {
    const header = res.headers['set-cookie'] as unknown as string[] | undefined;
    const cookie = header?.find((value) => value.startsWith('cm_refresh='));
    if (!cookie) throw new Error('No cm_refresh cookie in the response');
    return cookie;
}

// "cm_refresh=<token>; Path=...; HttpOnly" -> "cm_refresh=<token>", the form a browser sends back.
export const cookieValue = (setCookie: string) => setCookie.split(';')[0]!;

export const uploadedFileExists = (urlPath: string) =>
    fs.access(path.join(UPLOAD_ROOT, urlPath.replace(`${UPLOAD_URL_PREFIX}/`, ''))).then(
        () => true,
        () => false
    );
