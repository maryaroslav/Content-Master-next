import { expect, test } from '@playwright/test';
import { createUser, follow } from '../support/api';
import { signIn } from '../support/ui';

test('a follower starts a chat and both sides see the messages live', async ({ browser }) => {
    const alice = await createUser('alice');
    const bob = await createUser('bob');
    await follow(bob, alice);

    const alicePage = await (await browser.newContext()).newPage();
    const bobPage = await (await browser.newContext()).newPage();
    await signIn(alicePage, alice);
    await signIn(bobPage, bob);

    await alicePage.goto(`/profile/${bob.username}`);
    await alicePage.getByRole('button', { name: 'Add to friends' }).click();
    await expect(alicePage.getByRole('button', { name: 'Unfriend' })).toBeVisible();
    await alicePage.getByRole('link', { name: 'Send a message' }).click();
    await expect(alicePage).toHaveURL(new RegExp(`/chat\\?to=${bob.id}$`));

    const aliceInput = alicePage.getByPlaceholder('Write a message...');
    await aliceInput.fill('Hi Bob');
    await aliceInput.press('Enter');

    await bobPage.getByRole('link', { name: 'Messages, you have unread ones' }).click();
    await bobPage.getByRole('button', { name: alice.username }).click();
    await expect(bobPage.getByText('Hi Bob')).toBeVisible();
    await expect(bobPage.getByRole('link', { name: 'Messages' })).toBeVisible();

    const bobInput = bobPage.getByPlaceholder('Write a message...');
    await bobInput.fill('Hi Alice');
    await bobInput.press('Enter');
    await expect(alicePage.getByText('Hi Alice')).toBeVisible();
});
