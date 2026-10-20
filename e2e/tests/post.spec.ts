import { expect, test } from '@playwright/test';
import { createUser, uniqueName } from '../support/api';
import { pixelPng } from '../support/files';
import { signIn } from '../support/ui';

test('a post with an image is published and deleted', async ({ page }) => {
    await signIn(page, await createUser('poster'));
    const text = `E2E post ${uniqueName('p')}`;

    await page.locator('.addpost-container input[type=file]').setInputFiles(pixelPng);
    const input = page.getByPlaceholder('Share your thoughts or a post');
    await input.fill(text);
    await input.press('Enter');

    const post = page.locator('.feed-posts-user').filter({ hasText: text });
    const image = post.getByRole('img', { name: 'Post image' });
    await expect(image).toBeVisible();
    await expect(input).toHaveValue('');
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    await post.getByRole('button', { name: 'Post options' }).click();
    await page.getByRole('button', { name: 'Delete post' }).click();
    await expect(page.getByText(text)).toHaveCount(0);

    await page.reload();
    await expect(page.getByPlaceholder('Share your thoughts or a post')).toBeVisible();
    await expect(page.getByText(text)).toHaveCount(0);
});
