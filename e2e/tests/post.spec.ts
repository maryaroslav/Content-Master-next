import { expect, test } from '@playwright/test';
import { createUser, uniqueName } from '../support/api';
import { pixelPng } from '../support/files';
import { signIn } from '../support/ui';

test('a post with an image is published and deleted', async ({ page }) => {
    await signIn(page, await createUser('poster'));
    const text = `E2E post ${uniqueName('p')}`;

    await page.getByTestId('post-images').setInputFiles(pixelPng);
    const input = page.getByRole('textbox', { name: 'New post' });
    await input.fill(text);
    await page.getByRole('button', { name: 'Post', exact: true }).click();

    const post = page.getByRole('article').filter({ hasText: text });
    const image = post.getByRole('img', { name: 'Post image 1' });
    await expect(image).toBeVisible();
    await expect(input).toHaveValue('');
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    await post.getByRole('button', { name: 'Post options' }).click();
    await page.getByRole('menuitem', { name: 'Delete post' }).click();
    const confirm = page.getByRole('dialog', { name: 'Delete this post?' });
    await confirm.getByRole('button', { name: 'Delete post' }).click();
    await expect(page.getByText(text)).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('textbox', { name: 'New post' })).toBeVisible();
    await expect(page.getByText(text)).toHaveCount(0);
});
