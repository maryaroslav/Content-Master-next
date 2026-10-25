import { expect, test } from '@playwright/test';
import { createUser, uniqueName } from '../support/api';
import { pixelPng } from '../support/files';
import { signIn } from '../support/ui';

test('a community is created with the wizard', async ({ page }) => {
    await signIn(page, await createUser('owner'));
    const name = uniqueName('Club');

    await page.goto('/community');
    await page.getByRole('button', { name: 'Create a community' }).click();
    await page.getByText('Share content and communicate').click();

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await page.getByLabel('Community name').fill(name);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByText('Cooking and Recipes', { exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Cooking and Recipes' })).toBeChecked();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('textbox', { name: 'Description' }).fill('A community made by the end-to-end tests.');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByTestId('community-photo').setInputFiles(pixelPng);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText('Step 4 of 4')).toHaveCount(0);
    await expect(page.getByRole('list', { name: 'Created communities' }).getByText(name)).toBeVisible();
});
