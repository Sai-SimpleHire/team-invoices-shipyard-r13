import { z } from 'zod';

import { field } from '@/seams/validate';

import { invoiceTotals, toHundredths, toMinorUnits } from './totals';

/** What the invoice form sends. Checked in the browser before sending and on the server. */

const TWO_PLACES = /^\d+(\.\d{1,2})?$/;

/**
 * The database keeps each amount in a whole-number column that tops out near £21.4 million, so an
 * invoice above £20 million is refused here with a sentence rather than failing on save. The digit
 * limits keep quantity × price exact in JavaScript as well.
 */
const MAX_TOTAL_MINOR = 2_000_000_000;

const quantity = z
  .string()
  .trim()
  .regex(TWO_PLACES, 'Enter a quantity such as 1, 2.5 or 0.25.')
  .refine((value) => (toHundredths(value) ?? 0) > 0, 'The quantity must be more than 0.')
  .refine((value) => (value.split('.')[0] ?? '').length <= 4, 'Keep the quantity under 10,000.');

const unitPrice = z
  .string()
  .trim()
  .regex(TWO_PLACES, 'Enter a price such as 450 or 12.50.')
  .refine((value) => (value.split('.')[0] ?? '').length <= 7, 'Keep the price under £10,000,000.');

export const invoiceLineSchema = z.object({
  description: field
    .requiredText('a description')
    .pipe(z.string().max(500, 'Keep the description under 500 characters.')),
  quantity,
  unitPrice,
});

export const invoiceSchema = z
  .object({
    clientId: z.string().min(1, 'Choose the client this invoice is for.'),
    taxRate: z
      .string()
      .trim()
      .regex(TWO_PLACES, 'Enter a tax rate such as 20 or 0.')
      .refine((value) => (toHundredths(value) ?? 0) <= 10000, 'The tax rate cannot be over 100%.'),
    lines: z
      .array(invoiceLineSchema)
      .min(1, 'Add at least one line.')
      .max(100, 'An invoice can have at most 100 lines.'),
  })
  .refine((invoice) => withinLimit(invoice), {
    message: 'This invoice comes to more than £20,000,000, which is more than it can hold.',
    path: ['lines'],
  });

function withinLimit(invoice: {
  taxRate: string;
  lines: { quantity: string; unitPrice: string }[];
}): boolean {
  const lines = invoice.lines.map((line) => ({
    quantityHundredths: toHundredths(line.quantity) ?? 0,
    unitPriceMinor: toMinorUnits(line.unitPrice) ?? 0,
  }));
  const totals = invoiceTotals(lines, toHundredths(invoice.taxRate) ?? 0);
  return totals.totalMinor <= MAX_TOTAL_MINOR;
}

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const statusChangeSchema = z.object({
  status: z.enum(['SENT', 'PAID']),
});
