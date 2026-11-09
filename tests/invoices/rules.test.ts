import { describe, expect, it } from 'vitest';

import {
  canEditLines,
  canMoveTo,
  nextStatus,
  owedSummary,
  unpaidFirst,
  type ListedInvoice,
} from '@/lib/invoices/rules';

describe('an invoice moves draft -> sent -> paid', () => {
  it('only ever moves one step forward', () => {
    expect(canMoveTo('DRAFT', 'SENT')).toBe(true);
    expect(canMoveTo('SENT', 'PAID')).toBe(true);
    expect(canMoveTo('DRAFT', 'PAID')).toBe(false);
    expect(canMoveTo('PAID', 'SENT')).toBe(false);
    expect(canMoveTo('SENT', 'DRAFT')).toBe(false);
    expect(nextStatus('PAID')).toBeNull();
  });

  it('only lets a draft change its lines', () => {
    expect(canEditLines('DRAFT')).toBe(true);
    expect(canEditLines('SENT')).toBe(false);
    expect(canEditLines('PAID')).toBe(false);
  });
});

describe('the studio list', () => {
  const invoices: ListedInvoice[] = [
    { number: 1, status: 'PAID', totalMinor: 10000 },
    { number: 2, status: 'SENT', totalMinor: 25000 },
    { number: 3, status: 'DRAFT', totalMinor: 4000 },
    { number: 4, status: 'SENT', totalMinor: 12000 },
    { number: 5, status: 'PAID', totalMinor: 9000 },
  ];

  it('puts unpaid first: sent, then drafts, then paid, newest first in each', () => {
    expect(unpaidFirst(invoices).map((invoice) => invoice.number)).toEqual([4, 2, 3, 5, 1]);
  });

  it('counts only sent invoices as owed', () => {
    expect(owedSummary(invoices)).toEqual({ owedMinor: 37000, sentCount: 2, draftCount: 1 });
  });

  it('owes nothing when nothing has been sent', () => {
    expect(owedSummary([])).toEqual({ owedMinor: 0, sentCount: 0, draftCount: 0 });
  });
});
