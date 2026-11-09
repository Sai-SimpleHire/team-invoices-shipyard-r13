import { format, fromDecimal, money } from '@/seams/money';

/**
 * Working out an invoice's money, in whole pence, the same way in the browser (as people type)
 * and on the server (which is the copy that is saved).
 */

/** One currency for the whole app: more than one is out of scope for the first version. */
export const CURRENCY = 'GBP';

export interface LineAmounts {
  /** 150 means 1.5 — hours and days may have up to two decimal places. */
  quantityHundredths: number;
  unitPriceMinor: number;
}

export interface InvoiceTotals {
  lineAmountsMinor: number[];
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
}

const TWO_PLACES = /^(\d+)(?:\.(\d{1,2}))?$/;

/** "1.5" -> 150. Read as text so a quantity never passes through a float. */
export function toHundredths(text: string): number | null {
  const match = TWO_PLACES.exec(text.trim());
  if (!match) return null;
  const [, whole = '0', fraction = ''] = match;
  return Number.parseInt(whole, 10) * 100 + Number.parseInt(fraction.padEnd(2, '0'), 10);
}

/** "12.50" -> 1250 pence, or null when it is not an amount. */
export function toMinorUnits(text: string): number | null {
  if (!TWO_PLACES.test(text.trim())) return null;
  return fromDecimal(text.trim(), CURRENCY).minorUnits;
}

/** 150 -> "1.5"; 200 -> "2". */
export function hundredthsToText(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  const fraction = String(hundredths % 100)
    .padStart(2, '0')
    .replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : String(whole);
}

/** 1250 -> "12.50", for putting back into a price field. */
export function minorToText(minorUnits: number): string {
  const pence = String(minorUnits % 100).padStart(2, '0');
  return `${Math.floor(minorUnits / 100)}.${pence}`;
}

/** A line's amount, rounded half up to the penny once. */
export function lineAmountMinor(line: LineAmounts): number {
  return Math.round((line.unitPriceMinor * line.quantityHundredths) / 100);
}

/**
 * Subtotal, tax and total. Tax is worked out once on the subtotal, not per line, so it matches
 * what a client checking the invoice with a calculator gets.
 */
export function invoiceTotals(lines: LineAmounts[], taxRateBasisPoints: number): InvoiceTotals {
  const lineAmountsMinor = lines.map(lineAmountMinor);
  const subtotalMinor = lineAmountsMinor.reduce((sum, amount) => sum + amount, 0);
  const taxMinor = Math.round((subtotalMinor * taxRateBasisPoints) / 10000);
  return { lineAmountsMinor, subtotalMinor, taxMinor, totalMinor: subtotalMinor + taxMinor };
}

/** 2340 -> "£23.40". */
export function formatMoney(minorUnits: number): string {
  return format(money(minorUnits, CURRENCY), 'en-GB');
}

/** 7 -> "INV-0007". */
export function invoiceNumberLabel(number: number): string {
  return `INV-${String(number).padStart(4, '0')}`;
}
