import { expect, test } from '@playwright/test';
import speakeasy from 'speakeasy';
import { createUser } from '../support/api';
import { signIn, signOut } from '../support/ui';

test('two-factor authentication is set up with the manual key and asked for at the next sign-in', async ({ page }) => {
    const user = await createUser('tfa');
    await signIn(page, user);

    await page.goto('/settings');
    await page.getByRole('button', { name: 'Set up' }).click();
    const secret = (await page.locator('code').textContent())?.trim() ?? '';
    const code = () => speakeasy.totp({ secret, encoding: 'base32' });
    await page.getByPlaceholder('123456').fill(code());
    await page.getByRole('button', { name: 'Enable' }).click();
    await expect(page.getByText('On: signing in asks for a code from your authenticator app.')).toBeVisible();

    await signOut(page, user.username);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByText('Enter the code from your authenticator app')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByPlaceholder('123456').fill(code());
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL(/\/explore$/);
});
