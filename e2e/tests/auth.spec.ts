import { expect, test } from '@playwright/test';
import { uniqueName } from '../support/api';
import { signIn, signOut } from '../support/ui';

test('a new user registers, signs out and signs in again', async ({ page }) => {
    const username = uniqueName('reg');
    const account = { email: `${username}@e2e.test`, password: 'e2e-password-1' };

    await page.goto('/register');
    await page.getByLabel('Email').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByLabel('Username').fill(username);
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page).toHaveURL(/\/explore$/);
    await expect(page.getByRole('button', { name: username })).toBeVisible();

    await signOut(page, username);
    await signIn(page, account);
    await expect(page.getByRole('button', { name: username })).toBeVisible();
});
