import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Every studio sees only its own clients and invoices. There is no database in this test run, so
 * the database client is replaced and each query is checked for the studio it is limited to.
 */

const db = vi.hoisted(() => {
  const model = () => ({
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'new', number: 1, name: 'x' }),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    upsert: vi.fn().mockResolvedValue({ organizationId: 'studio-a', lastNumber: 42 }),
  });
  const client = {
    client: model(),
    invoice: model(),
    invoiceLine: model(),
    invoiceCounter: model(),
    $transaction: vi.fn(),
  };
  client.$transaction.mockImplementation((work: (tx: unknown) => unknown) => work(client));
  return client;
});

vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { changeClient } from '@/lib/clients/service';
import { listClients } from '@/lib/clients/queries';
import { changeStatus, createInvoice, saveDraft } from '@/lib/invoices/service';
import { listInvoices } from '@/lib/invoices/queries';
import { scoped } from '@/seams/db';

const studioA = scoped('studio-a');
const invoiceInput = {
  clientId: 'client-of-b',
  taxRate: '20',
  lines: [{ description: 'Poster', quantity: '1', unitPrice: '100' }],
};

beforeEach(() => vi.clearAllMocks());

describe('lists are limited to the signed-in studio', () => {
  it('lists only this studio clients and invoices', async () => {
    await listClients(studioA);
    await listInvoices(studioA);
    expect(db.client.findMany.mock.calls[0]?.[0].where).toEqual({ organizationId: 'studio-a' });
    expect(db.invoice.findMany.mock.calls[0]?.[0].where).toEqual({ organizationId: 'studio-a' });
  });

  it('refuses to build a query without a studio', () => {
    expect(() => scoped('')).toThrow();
  });
});

describe('another studio records cannot be reached by id', () => {
  it('treats another studio client as not found when editing it', async () => {
    db.client.updateMany.mockResolvedValueOnce({ count: 0 });
    const result = await changeClient(studioA, 'client-of-b', {
      name: 'x',
      email: 'x@example.com',
      address: '',
    });
    expect(db.client.updateMany.mock.calls[0]?.[0].where).toEqual({
      id: 'client-of-b',
      organizationId: 'studio-a',
    });
    expect(result).toMatchObject({ ok: false, status: 404 });
  });

  it('will not invoice another studio client', async () => {
    const result = await createInvoice(studioA, { invoice: invoiceInput, createdById: 'u1' });
    expect(db.client.findFirst.mock.calls[0]?.[0].where).toEqual({
      id: 'client-of-b',
      organizationId: 'studio-a',
    });
    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(db.invoice.create).not.toHaveBeenCalled();
  });

  it('cannot see, change or move on another studio invoice', async () => {
    const edit = await saveDraft(studioA, 'invoice-of-b', invoiceInput);
    const move = await changeStatus(studioA, { id: 'invoice-of-b', to: 'PAID' });
    expect(edit).toMatchObject({ ok: false, status: 404 });
    expect(move).toMatchObject({ ok: false, status: 404 });
    for (const call of db.invoice.findFirst.mock.calls) {
      expect(call[0].where.organizationId).toBe('studio-a');
    }
    expect(db.invoice.updateMany).not.toHaveBeenCalled();
  });
});

describe('numbering and status changes', () => {
  it('gives a new invoice the studio next number from its own counter', async () => {
    db.client.findFirst.mockResolvedValueOnce({ id: 'client-of-a' });
    await createInvoice(studioA, {
      invoice: { ...invoiceInput, clientId: 'client-of-a' },
      createdById: 'u1',
    });
    expect(db.invoiceCounter.upsert.mock.calls[0]?.[0]).toMatchObject({
      where: { organizationId: 'studio-a' },
      update: { lastNumber: { increment: 1 } },
    });
    const created = db.invoice.create.mock.calls[0]?.[0].data;
    expect(created).toMatchObject({ number: 42, organizationId: 'studio-a', totalMinor: 12000 });
  });

  it('refuses to change the lines of a sent invoice', async () => {
    db.invoice.findFirst.mockResolvedValueOnce({ id: 'i1', status: 'SENT' });
    const result = await saveDraft(studioA, 'i1', invoiceInput);
    expect(result).toMatchObject({ ok: false, status: 409 });
    expect(db.invoice.updateMany).not.toHaveBeenCalled();
  });

  it('refuses to skip from draft straight to paid', async () => {
    db.invoice.findFirst.mockResolvedValueOnce({ id: 'i1', status: 'DRAFT' });
    const result = await changeStatus(studioA, { id: 'i1', to: 'PAID' });
    expect(result).toMatchObject({ ok: false, status: 409 });
  });

  it('marks a sent invoice paid, only if it is still sent', async () => {
    db.invoice.findFirst.mockResolvedValueOnce({ id: 'i1', status: 'SENT' });
    const result = await changeStatus(studioA, { id: 'i1', to: 'PAID' });
    expect(result).toEqual({ ok: true, value: { id: 'i1', status: 'PAID' } });
    const update = db.invoice.updateMany.mock.calls[0]?.[0];
    expect(update.where).toEqual({ id: 'i1', status: 'SENT', organizationId: 'studio-a' });
    expect(update.data.status).toBe('PAID');
    expect(update.data.paidAt).toBeInstanceOf(Date);
  });
});
