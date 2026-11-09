import { prisma } from '@/lib/prisma';
import type { ScopedClient } from '@/seams/db';

import type { PricedInvoice } from './pricing';
import type { InvoiceStatus } from './rules';

/** Every read and write here is limited to one studio through `db.where()`. */

export interface InvoiceListRow {
  id: string;
  number: number;
  status: InvoiceStatus;
  totalMinor: number;
  createdAt: Date;
  clientName: string;
}

export async function listInvoices(db: ScopedClient): Promise<InvoiceListRow[]> {
  const invoices = await prisma.invoice.findMany({
    where: db.where(),
    orderBy: { number: 'desc' },
    select: {
      id: true,
      number: true,
      status: true,
      totalMinor: true,
      createdAt: true,
      client: { select: { name: true } },
    },
  });
  return invoices.map(({ client, ...invoice }) => ({ ...invoice, clientName: client.name }));
}

export async function findInvoice(db: ScopedClient, id: string) {
  return prisma.invoice.findFirst({
    where: db.where({ id }),
    include: {
      lines: { orderBy: { position: 'asc' } },
      client: { select: { id: true, name: true } },
    },
  });
}

export type InvoiceDetail = NonNullable<Awaited<ReturnType<typeof findInvoice>>>;

/**
 * Create an invoice with the studio's next number. The counter is bumped in the same transaction,
 * so two people creating invoices at once still get different numbers, and a number is never
 * handed out twice (the unique index on studio + number is the backstop).
 */
export async function createInvoice(
  db: ScopedClient,
  input: { invoice: PricedInvoice; createdById: string },
) {
  const { lines, ...invoice } = input.invoice;
  return prisma.$transaction(async (tx) => {
    const counter = await tx.invoiceCounter.upsert({
      where: { organizationId: db.organizationId },
      create: { organizationId: db.organizationId, lastNumber: 1 },
      update: { lastNumber: { increment: 1 } },
    });
    return tx.invoice.create({
      data: {
        ...invoice,
        organizationId: db.organizationId,
        number: counter.lastNumber,
        createdById: input.createdById,
        lines: { create: lines },
      },
      select: { id: true, number: true },
    });
  });
}

/** Replace a draft's client, tax and lines. Returns 0 when it is not a draft in this studio. */
export async function replaceDraft(db: ScopedClient, id: string, priced: PricedInvoice) {
  const { lines, ...invoice } = priced;
  return prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.updateMany({
      where: db.where({ id, status: 'DRAFT' as const }),
      data: invoice,
    });
    if (updated.count === 0) return 0;
    // Lines have no studio of their own: they are reached only through the invoice checked above.
    await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
    await tx.invoiceLine.createMany({ data: lines.map((line) => ({ ...line, invoiceId: id })) });
    return updated.count;
  });
}

/** Move an invoice on, only if it is still in the status the caller saw. Returns rows changed. */
export async function moveStatus(
  db: ScopedClient,
  input: { id: string; from: InvoiceStatus; to: InvoiceStatus },
) {
  const now = new Date();
  const result = await prisma.invoice.updateMany({
    where: db.where({ id: input.id, status: input.from }),
    data: {
      status: input.to,
      ...(input.to === 'SENT' ? { sentAt: now } : {}),
      ...(input.to === 'PAID' ? { paidAt: now } : {}),
    },
  });
  return result.count;
}
