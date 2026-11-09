import { expect, test } from '@playwright/test';

import { addClient, startStudio } from './studio';

/** Every studio's information is completely separate from every other studio's. */

test('another studio cannot see or open this studio invoices and clients', async ({ browser }) => {
  const first = await browser.newContext();
  const ownerA = await first.newPage();
  await startStudio(ownerA, 'Alder Studio');
  await addClient(ownerA, 'Secret Client of Alder', 'secret@alder.test');
  await ownerA.goto('/invoices/new');
  await ownerA.getByLabel('Client').selectOption({ label: 'Secret Client of Alder' });
  const line = ownerA.getByRole('group', { name: 'Line 1' });
  await line.getByLabel('Description').fill('Private work');
  await line.getByLabel('Unit price (£)').fill('500');
  await ownerA.getByRole('button', { name: 'Create invoice' }).click();
  await expect(ownerA.getByRole('heading', { name: /INV-0001/ })).toBeVisible();
  const invoiceUrl = ownerA.url();

  const second = await browser.newContext();
  const ownerB = await second.newPage();
  await startStudio(ownerB, 'Birch Studio');
  await expect(ownerB.getByText('No invoices yet.')).toBeVisible();

  await ownerB.goto('/clients');
  await expect(ownerB.getByText('No clients yet.')).toBeVisible();
  await expect(ownerB.getByText('Secret Client of Alder')).toHaveCount(0);

  await ownerB.goto(invoiceUrl);
  await expect(ownerB.getByRole('heading', { name: 'This page is not here' })).toBeVisible();
  await expect(ownerB.getByText('Private work')).toHaveCount(0);

  // Birch's own first invoice is INV-0001 too: numbers belong to each studio.
  await addClient(ownerB, 'Birch Client', 'hi@birchclient.test');
  await ownerB.goto('/invoices/new');
  await ownerB.getByLabel('Client').selectOption({ label: 'Birch Client' });
  await ownerB.getByRole('group', { name: 'Line 1' }).getByLabel('Description').fill('Work');
  await ownerB.getByRole('group', { name: 'Line 1' }).getByLabel('Unit price (£)').fill('10');
  await ownerB.getByRole('button', { name: 'Create invoice' }).click();
  await expect(ownerB.getByRole('heading', { name: /INV-0001/ })).toBeVisible();

  await first.close();
  await second.close();
});
