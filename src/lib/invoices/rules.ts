/** How an invoice moves through its life, and how the studio's list is ordered. */

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

/** Forward only: a paid invoice does not quietly become unpaid again. */
const NEXT_STATUS: Record<InvoiceStatus, InvoiceStatus | null> = {
  DRAFT: 'SENT',
  SENT: 'PAID',
  PAID: null,
};

export function nextStatus(status: InvoiceStatus): InvoiceStatus | null {
  return NEXT_STATUS[status];
}

export function canMoveTo(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return NEXT_STATUS[from] === to;
}

/** Once an invoice has gone to the client, what it says must not change under them. */
export function canEditLines(status: InvoiceStatus): boolean {
  return status === 'DRAFT';
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent, unpaid',
  PAID: 'Paid',
};

export const STATUS_TONE: Record<InvoiceStatus, 'neutral' | 'warn' | 'ok'> = {
  DRAFT: 'neutral',
  SENT: 'warn',
  PAID: 'ok',
};

/** Sent (owed) first, then drafts, then paid. */
const LIST_ORDER: Record<InvoiceStatus, number> = { SENT: 0, DRAFT: 1, PAID: 2 };

export interface ListedInvoice {
  number: number;
  status: InvoiceStatus;
  totalMinor: number;
}

/** Unpaid first; newest first within each group. */
export function unpaidFirst<T extends ListedInvoice>(invoices: readonly T[]): T[] {
  return [...invoices].sort(
    (left, right) =>
      LIST_ORDER[left.status] - LIST_ORDER[right.status] || right.number - left.number,
  );
}

export interface OwedSummary {
  owedMinor: number;
  sentCount: number;
  draftCount: number;
}

/** What the studio is still owed: invoices that have gone out and not been paid. */
export function owedSummary(invoices: readonly ListedInvoice[]): OwedSummary {
  const sent = invoices.filter((invoice) => invoice.status === 'SENT');
  return {
    owedMinor: sent.reduce((sum, invoice) => sum + invoice.totalMinor, 0),
    sentCount: sent.length,
    draftCount: invoices.filter((invoice) => invoice.status === 'DRAFT').length,
  };
}
