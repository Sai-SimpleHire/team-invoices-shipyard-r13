import { expect, test } from '@playwright/test';

import { expectFitsPhone, freshEmail, signIn, startStudio } from './studio';

/** Flow 1, second half: the owner adds a colleague, who signs in to the same studio. */

test('an owner adds a colleague who can sign in to the same studio', async ({ page }) => {
  await startStudio(page, 'Kestrel Studio', 'Morgan Kestrel');
  const colleague = freshEmail('colleague');

  await page.getByRole('link', { name: 'Team' }).click();
  await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a colleague' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a colleague' });
  await dialog.getByLabel('Name').fill('Robin Ash');
  await dialog.getByLabel('Email').fill(colleague);
  await dialog.getByLabel('Starting password').fill('Copper-Kettle-Lane-62');
  await dialog.getByRole('button', { name: 'Add to studio' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText('Robin Ash can now sign in')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Robin Ash' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Morgan Kestrel' })).toBeVisible();
  await expectFitsPhone(page);

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await signIn(page, colleague, 'Copper-Kettle-Lane-62');
  await expect(page.getByRole('heading', { name: 'Invoices', exact: true })).toBeVisible();
  await expect(page.getByText('Kestrel Studio', { exact: true })).toBeVisible();
  await expect(page.getByText('Signed in as Robin Ash')).toBeVisible();
});

test('a weak starting password is refused next to its field', async ({ page }) => {
  await startStudio(page, 'Weak Password Studio');
  await page.goto('/team');
  await page.getByRole('button', { name: 'Add a colleague' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a colleague' });
  await dialog.getByLabel('Name').fill('Sam');
  await dialog.getByLabel('Email').fill(freshEmail('weak'));
  await dialog.getByLabel('Starting password').fill('aaaaaaaaaaaaaa');
  await dialog.getByRole('button', { name: 'Add to studio' }).click();

  await expect(dialog.getByText(/three of|repeating/)).toBeVisible();
  await expect(dialog).toBeVisible();
});
