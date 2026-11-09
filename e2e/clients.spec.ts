import { expect, test } from '@playwright/test';

import { addClient, expectFitsPhone, startStudio } from './studio';

/** Flow 2: anyone in the studio adds clients (name, email, address) and can edit one. */

test('the client list says what to do when it is empty', async ({ page }) => {
  await startStudio(page, 'Empty Clients Studio');
  await page.getByRole('link', { name: 'Clients' }).click();
  await expect(page.getByText('No clients yet.')).toBeVisible();
});

test('a client is added, then edited', async ({ page }) => {
  await startStudio(page, 'Harbour Studio');
  await addClient(page, 'Tidewater Bakery', 'hello@tidewater.test');
  await expect(page.getByRole('cell', { name: 'hello@tidewater.test' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1 High Street' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit Tidewater Bakery' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit Tidewater Bakery' });
  await dialog.getByLabel('Name').fill('Tidewater Bakery Ltd');
  await dialog.getByRole('button', { name: 'Save client' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('cell', { name: 'Tidewater Bakery Ltd', exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('cell', { name: 'Tidewater Bakery Ltd', exact: true })).toBeVisible();
  await expectFitsPhone(page);
});

test('a client needs a name and a real email address', async ({ page }) => {
  await startStudio(page, 'Checks Studio');
  await page.goto('/clients');
  await page.getByRole('button', { name: 'Add client' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a client' });
  await dialog.getByLabel('Email').fill('not-an-email');
  await dialog.getByRole('button', { name: 'Save client' }).click();

  await expect(dialog.getByText("Please enter the client's name.")).toBeVisible();
  await expect(dialog.getByText('That does not look like an email address.')).toBeVisible();
});
