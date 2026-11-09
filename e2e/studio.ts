import { expect, type Page } from '@playwright/test';

/**
 * Steps every core-flow check shares. Each check makes its own studio with a fresh address, so no
 * check depends on data another one left behind.
 */

export const PASSWORD = 'Plum-Window-Ledger-48';

export function freshEmail(who: string): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return `${who}-${stamp}@checks.test`;
}

export async function signIn(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** An owner signs up, signs in and names their studio; they land on Invoices. */
export async function startStudio(
  page: Page,
  studioName: string,
  ownerName = 'Alex Owner',
): Promise<string> {
  const email = freshEmail('owner');
  await page.goto('/register');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Choose a password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/sign-in/);

  await signIn(page, email);
  await expect(page.getByRole('heading', { name: 'Name your studio' })).toBeVisible();
  await page.getByLabel('Studio name').fill(studioName);
  await page.getByLabel('Your name').fill(ownerName);
  await page.getByRole('button', { name: 'Create studio' }).click();
  await expect(page.getByRole('heading', { name: 'Invoices', exact: true })).toBeVisible();
  return email;
}

export async function addClient(page: Page, name: string, email: string): Promise<void> {
  await page.goto('/clients');
  await page.getByRole('button', { name: 'Add client' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a client' });
  await dialog.getByLabel('Name').fill(name);
  await dialog.getByLabel('Email').fill(email);
  await dialog.getByLabel('Address').fill('1 High Street\nBristol');
  await dialog.getByRole('button', { name: 'Save client' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
}

/** The page is no wider than a 390 px phone. */
export async function expectFitsPhone(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 });
  const { content, screen } = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    screen: window.innerWidth,
  }));
  expect(content, 'the page is no wider than a phone').toBeLessThanOrEqual(screen + 1);
  await page.setViewportSize({ width: 1280, height: 800 });
}
