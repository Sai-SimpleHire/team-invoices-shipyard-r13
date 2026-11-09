import { describe, expect, it } from 'vitest';

import { priceInvoice } from '@/lib/invoices/pricing';
import { invoiceSchema } from '@/lib/invoices/schema';
import {
  formatMoney,
  hundredthsToText,
  invoiceNumberLabel,
  invoiceTotals,
  lineAmountMinor,
  minorToText,
  toHundredths,
  toMinorUnits,
} from '@/lib/invoices/totals';
import { validate } from '@/seams/validate';

describe('reading what people type', () => {
  it('reads quantities with up to two decimal places, without floats', () => {
    expect(toHundredths('1')).toBe(100);
    expect(toHundredths('1.5')).toBe(150);
    expect(toHundredths('0.25')).toBe(25);
    expect(toHundredths(' 7.50 ')).toBe(750);
    expect(toHundredths('1.234')).toBeNull();
    expect(toHundredths('abc')).toBeNull();
    expect(toHundredths('-1')).toBeNull();
  });

  it('reads prices into pence', () => {
    expect(toMinorUnits('12.50')).toBe(1250);
    expect(toMinorUnits('450')).toBe(45000);
    expect(toMinorUnits('0.1')).toBe(10);
    expect(toMinorUnits('12.505')).toBeNull();
  });

  it('writes amounts back into the form unchanged', () => {
    expect(hundredthsToText(150)).toBe('1.5');
    expect(hundredthsToText(200)).toBe('2');
    expect(hundredthsToText(25)).toBe('0.25');
    expect(minorToText(1250)).toBe('12.50');
    expect(minorToText(5)).toBe('0.05');
  });
});

describe('working out the totals', () => {
  it('multiplies quantity by unit price, rounded to the penny once', () => {
    expect(lineAmountMinor({ quantityHundredths: 150, unitPriceMinor: 4500 })).toBe(6750);
    // 0.33 × £0.10 = 3.3p, which rounds to 3p.
    expect(lineAmountMinor({ quantityHundredths: 33, unitPriceMinor: 10 })).toBe(3);
  });

  it('adds the lines, works out tax on the subtotal, and adds it on', () => {
    const totals = invoiceTotals(
      [
        { quantityHundredths: 100, unitPriceMinor: 120000 },
        { quantityHundredths: 350, unitPriceMinor: 6000 },
      ],
      2000,
    );
    expect(totals.lineAmountsMinor).toEqual([120000, 21000]);
    expect(totals.subtotalMinor).toBe(141000);
    expect(totals.taxMinor).toBe(28200);
    expect(totals.totalMinor).toBe(169200);
  });

  it('handles 0.1 + 0.2 exactly, which floats do not', () => {
    const totals = invoiceTotals(
      [
        { quantityHundredths: 100, unitPriceMinor: 10 },
        { quantityHundredths: 100, unitPriceMinor: 20 },
      ],
      0,
    );
    expect(totals.totalMinor).toBe(30);
  });

  it('rounds tax half up, once, on the subtotal', () => {
    // 17.5% of £0.10 is 1.75p -> 2p.
    expect(invoiceTotals([{ quantityHundredths: 100, unitPriceMinor: 10 }], 1750).taxMinor).toBe(2);
  });

  it('prices a checked form the same way on the server', () => {
    const priced = priceInvoice({
      clientId: 'c1',
      taxRate: '20',
      lines: [{ description: 'Logo design', quantity: '2.5', unitPrice: '80' }],
    });
    expect(priced.taxRateBasisPoints).toBe(2000);
    expect(priced.lines[0]).toMatchObject({ position: 0, amountMinor: 20000 });
    expect(priced.totalMinor).toBe(24000);
  });
});

describe('showing money and numbers', () => {
  it('shows pounds and invoice numbers', () => {
    expect(formatMoney(169200)).toBe('£1,692.00');
    expect(invoiceNumberLabel(7)).toBe('INV-0007');
    expect(invoiceNumberLabel(12345)).toBe('INV-12345');
  });
});

describe('checking the invoice form', () => {
  const good = {
    clientId: 'c1',
    taxRate: '20',
    lines: [{ description: 'Brand workshop', quantity: '1', unitPrice: '900' }],
  };

  it('accepts a complete invoice', () => {
    expect(validate(invoiceSchema, good).ok).toBe(true);
  });

  it('says what is wrong, next to the field', () => {
    const result = validate(invoiceSchema, {
      clientId: '',
      taxRate: '120',
      lines: [{ description: '', quantity: '0', unitPrice: 'lots' }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors)).toEqual(
      expect.arrayContaining([
        'clientId',
        'taxRate',
        'lines.0.description',
        'lines.0.quantity',
        'lines.0.unitPrice',
      ]),
    );
  });

  it('needs at least one line', () => {
    const result = validate(invoiceSchema, { ...good, lines: [] });
    expect(result.ok).toBe(false);
  });
});

describe('amounts the database can hold', () => {
  const line = { description: 'Campaign', quantity: '1', unitPrice: '100' };

  it('refuses an invoice over £20 million with a sentence, not a failed save', () => {
    const result = validate(invoiceSchema, {
      clientId: 'c1',
      taxRate: '20',
      lines: [{ ...line, quantity: '9000', unitPrice: '9000000' }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.lines).toContain('more than £20,000,000');
  });

  it('refuses prices and quantities too long to multiply exactly', () => {
    const result = validate(invoiceSchema, {
      clientId: 'c1',
      taxRate: '0',
      lines: [{ ...line, quantity: '12345', unitPrice: '12345678' }],
    });
    expect(result.ok ? [] : Object.keys(result.fieldErrors)).toEqual(
      expect.arrayContaining(['lines.0.quantity', 'lines.0.unitPrice']),
    );
  });
});
