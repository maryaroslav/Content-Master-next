import crypto from 'node:crypto';
import type { AuthSession, User } from '@cm/contracts';
import { API_URL } from './settings';

export interface TestUser {
    id: number;
    username: string;
    email: string;
    password: string;
    accessToken: string;
}

async function request<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            ...(body === undefined ? {} : { 'content-type': 'application/json' }),
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`${method} ${path} failed: ${response.status} ${await response.text()}`);
    return (response.status === 204 ? undefined : await response.json()) as T;
}

export const uniqueName = (prefix: string) => `${prefix}_${crypto.randomBytes(4).toString('hex')}`;

export async function createUser(prefix: string): Promise<TestUser> {
    const username = uniqueName(prefix);
    const email = `${username}@e2e.test`;
    const password = 'e2e-password-1';
    const user = await request<User>('POST', '/auth/register', { email, password, username });
    const session = await request<AuthSession>('POST', '/auth/login', { email, password });
    return { id: user.id, username, email, password, accessToken: session.accessToken };
}

export const follow = (follower: TestUser, followee: TestUser) =>
    request('PUT', `/users/${followee.id}/follow`, undefined, follower.accessToken);
