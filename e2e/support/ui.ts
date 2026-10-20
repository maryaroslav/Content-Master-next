import { expect, type Page } from '@playwright/test';
import type { TestUser } from './api';

export async function signIn(page: Page, user: Pick<TestUser, 'email' | 'password'>) {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL(/\/explore$/);
}

export async function signOut(page: Page, username: string) {
    await page.getByRole('button', { name: username }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login$/);
}
