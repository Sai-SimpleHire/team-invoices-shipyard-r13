import type { InvoiceInput } from '@/lib/invoices/schema';
import {
  hundredthsToText,
  invoiceTotals,
  minorToText,
  toHundredths,
  toMinorUnits,
  type InvoiceTotals,
} from '@/lib/invoices/totals';

/** The invoice form while it is being typed: text, exactly as entered. */

export interface DraftLine {
  /** Stable identity for React while lines are added and removed. */
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

export interface DraftInvoice {
  clientId: string;
  taxRate: string;
  lines: DraftLine[];
}

export interface SavedInvoiceShape {
  clientId: string;
  taxRateBasisPoints: number;
  lines: { description: string; quantityHundredths: number; unitPriceMinor: number }[];
}

export function emptyLine(key: number): DraftLine {
  return { key, description: '', quantity: '1', unitPrice: '' };
}

/** A new invoice starts with one empty line and the standard UK VAT rate, both changeable. */
export function newDraft(clientId: string): DraftInvoice {
  return { clientId, taxRate: '20', lines: [emptyLine(0)] };
}

export function draftFromSaved(invoice: SavedInvoiceShape): DraftInvoice {
  return {
    clientId: invoice.clientId,
    taxRate: hundredthsToText(invoice.taxRateBasisPoints),
    lines: invoice.lines.map((line, index) => ({
      key: index,
      description: line.description,
      quantity: hundredthsToText(line.quantityHundredths),
      unitPrice: minorToText(line.unitPriceMinor),
    })),
  };
}

/** Totals as they type. A half-typed number counts as 0 until it reads as a number. */
export function liveTotals(draft: DraftInvoice): InvoiceTotals {
  const lines = draft.lines.map((line) => ({
    quantityHundredths: toHundredths(line.quantity) ?? 0,
    unitPriceMinor: toMinorUnits(line.unitPrice) ?? 0,
  }));
  return invoiceTotals(lines, toHundredths(draft.taxRate) ?? 0);
}

export function draftToInput(draft: DraftInvoice): InvoiceInput {
  return {
    clientId: draft.clientId,
    taxRate: draft.taxRate,
    lines: draft.lines.map(({ description, quantity, unitPrice }) => ({
      description,
      quantity,
      unitPrice,
    })),
  };
}
