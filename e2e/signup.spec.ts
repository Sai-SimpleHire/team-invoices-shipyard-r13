import { expect, test } from '@playwright/test';

import { expectFitsPhone, startStudio } from './studio';

/** Flow 1: an owner signs up, which creates their studio. */

test('someone signed out is sent to sign in', async ({ page }) => {
  await page.goto('/invoices');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('an owner signs up, names their studio and lands on an empty invoice list', async ({
  page,
}) => {
  await startStudio(page, 'Fernhill Studio');

  await expect(page.getByText('Fernhill Studio', { exact: true })).toBeVisible();
  await expect(page.getByText('No invoices yet.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'adding a client' })).toBeVisible();
  await expectFitsPhone(page);
});

test('the studio name cannot be left empty', async ({ page }) => {
  const email = `blank-${Date.now()}@checks.test`;
  await page.goto('/register');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Choose a password').fill('Plum-Window-Ledger-48');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('Plum-Window-Ledger-48');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: 'Create studio' }).click();
  await expect(page.getByText('Please enter the name of your studio.')).toBeVisible();
});

test('signing out returns to the sign-in screen', async ({ page }) => {
  await startStudio(page, 'Signout Studio');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.goto('/invoices');
  await expect(page).toHaveURL(/\/sign-in/);
});
