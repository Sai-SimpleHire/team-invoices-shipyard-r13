import { expect, test, type Page } from '@playwright/test';

import { addClient, expectFitsPhone, startStudio } from './studio';

/**
 * Flows 3 and 4: an invoice with line items and worked-out totals gets the studio's next number,
 * moves draft -> sent -> paid, and the list shows unpaid first with the total still owed.
 */

async function fillLine(page: Page, index: number, line: [string, string, string]) {
  const [description, quantity, unitPrice] = line;
  const row = page.getByRole('group', { name: `Line ${index + 1}` });
  await row.getByLabel('Description').fill(description);
  await row.getByLabel('Quantity').fill(quantity);
  await row.getByLabel('Unit price (£)').fill(unitPrice);
}

test('an invoice is created with correct totals, sent and paid', async ({ page }) => {
  await startStudio(page, 'Linden Studio');
  await addClient(page, 'Northgate Books', 'accounts@northgate.test');

  await page.getByRole('link', { name: 'Invoices' }).click();
  await page.getByRole('link', { name: 'New invoice' }).click();
  await expect(page.getByRole('heading', { name: 'New invoice' })).toBeVisible();
  await page.getByLabel('Client').selectOption({ label: 'Northgate Books' });
  await fillLine(page, 0, ['Brand identity', '1', '1200']);
  await page.getByRole('button', { name: 'Add a line' }).click();
  await fillLine(page, 1, ['Design hours', '3.5', '60']);
  await page.getByLabel('Tax rate (%)').fill('20');

  // Worked out as they type: 1,200 + 3.5 × 60 = 1,410; 20% tax = 282; total 1,692.
  await expect(page.getByText('£1,410.00')).toBeVisible();
  await expect(page.getByText('£282.00')).toBeVisible();
  await expect(page.getByText('£1,692.00')).toBeVisible();

  await page.getByRole('button', { name: 'Create invoice' }).click();
  await expect(page.getByRole('heading', { name: /INV-0001/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Draft/ })).toBeVisible();
  await expectFitsPhone(page);

  await page.getByRole('button', { name: 'Mark as sent' }).click();
  await expect(page.getByRole('heading', { name: /Sent, unpaid/ })).toBeVisible();
  await expect(page.getByText('its lines can no longer change')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Description' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Back to invoices' }).click();
  await expect(page.getByText('£1,692.00 still owed')).toBeVisible();
  await expect(page.getByText('across 1 sent invoice')).toBeVisible();

  await page.getByRole('link', { name: 'INV-0001' }).click();
  await page.getByRole('button', { name: 'Mark as paid' }).click();
  await expect(page.getByRole('heading', { name: /Paid/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Mark as/ })).toHaveCount(0);

  await page.getByRole('link', { name: 'Back to invoices' }).click();
  await expect(page.getByText('£0.00 still owed')).toBeVisible();
});

test('numbers follow on and unpaid invoices come first', async ({ page }) => {
  await startStudio(page, 'Sequence Studio');
  await addClient(page, 'Orchard Cafe', 'hi@orchard.test');

  for (const price of ['100', '200']) {
    await page.goto('/invoices/new');
    await page.getByLabel('Client').selectOption({ label: 'Orchard Cafe' });
    await fillLine(page, 0, ['Menu design', '1', price]);
    await page.getByRole('button', { name: 'Create invoice' }).click();
    await expect(page.getByRole('heading', { name: /INV-000/ })).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: /INV-0002/ })).toBeVisible();

  // Send the first one: it moves to the top, ahead of the newer draft.
  await page.goto('/invoices');
  await page.getByRole('link', { name: 'INV-0001' }).click();
  await page.getByRole('button', { name: 'Mark as sent' }).click();
  await expect(page.getByRole('heading', { name: /Sent, unpaid/ })).toBeVisible();

  await page.goto('/invoices');
  const numbers = page.getByRole('link', { name: /^INV-/ });
  await expect(numbers).toHaveText(['INV-0001', 'INV-0002']);
  await expect(page.getByText('£120.00 still owed')).toBeVisible();
  await expect(page.getByText('1 draft not sent yet')).toBeVisible();
  await expectFitsPhone(page);
});

test('a draft can be changed and saved', async ({ page }) => {
  await startStudio(page, 'Draft Studio');
  await addClient(page, 'Willow Florist', 'hi@willow.test');
  await page.goto('/invoices/new');
  await page.getByLabel('Client').selectOption({ label: 'Willow Florist' });
  await fillLine(page, 0, ['Logo', '1', '300']);
  await page.getByRole('button', { name: 'Create invoice' }).click();
  await expect(page.getByRole('heading', { name: /INV-0001/ })).toBeVisible();

  await fillLine(page, 0, ['Logo and colours', '2', '300']);
  await page.getByLabel('Tax rate (%)').fill('0');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Description' })).toHaveValue('Logo and colours');
  await expect(page.getByText('£600.00').first()).toBeVisible();
});

test('an invoice that is not filled in says what is missing', async ({ page }) => {
  await startStudio(page, 'Missing Studio');
  await addClient(page, 'Birch Gallery', 'hi@birch.test');
  await page.goto('/invoices/new');
  await page.getByLabel('Client').selectOption({ label: 'Choose a client' });
  await page.getByRole('button', { name: 'Create invoice' }).click();

  await expect(page.getByText('Choose the client this invoice is for.')).toBeVisible();
  await expect(page.getByText('Please enter a description.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'New invoice' })).toBeVisible();
});

test('with no clients, a new invoice points to adding one', async ({ page }) => {
  await startStudio(page, 'No Clients Studio');
  await page.goto('/invoices/new');
  await expect(page.getByRole('link', { name: 'Add a client first' })).toBeVisible();
});
