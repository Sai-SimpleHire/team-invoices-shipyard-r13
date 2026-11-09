import type { InvoiceInput } from './schema';
import { invoiceTotals, toHundredths, toMinorUnits } from './totals';

/** An invoice as it is saved: every amount worked out here, never taken from the browser. */
export interface PricedLine {
  position: number;
  description: string;
  quantityHundredths: number;
  unitPriceMinor: number;
  amountMinor: number;
}

export interface PricedInvoice {
  clientId: string;
  taxRateBasisPoints: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  lines: PricedLine[];
}

/** Turn the checked form into pence and hundredths, and work out the totals. */
export function priceInvoice(input: InvoiceInput): PricedInvoice {
  const lines = input.lines.map((line) => ({
    description: line.description,
    quantityHundredths: toHundredths(line.quantity) ?? 0,
    unitPriceMinor: toMinorUnits(line.unitPrice) ?? 0,
  }));
  const taxRateBasisPoints = toHundredths(input.taxRate) ?? 0;
  const totals = invoiceTotals(lines, taxRateBasisPoints);
  return {
    clientId: input.clientId,
    taxRateBasisPoints,
    subtotalMinor: totals.subtotalMinor,
    taxMinor: totals.taxMinor,
    totalMinor: totals.totalMinor,
    lines: lines.map((line, index) => ({
      ...line,
      position: index,
      amountMinor: totals.lineAmountsMinor[index] ?? 0,
    })),
  };
}
