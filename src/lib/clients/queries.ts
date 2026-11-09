import { prisma } from '@/lib/prisma';
import type { ScopedClient } from '@/seams/db';

import type { ClientInput } from './schema';

/** Every read and write here is limited to one studio through `db.where()`. */

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  address: string;
  invoiceCount: number;
}

export async function listClients(db: ScopedClient): Promise<ClientRow[]> {
  const clients = await prisma.client.findMany({
    where: db.where(),
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      _count: { select: { invoices: true } },
    },
  });
  return clients.map(({ _count, ...client }) => ({ ...client, invoiceCount: _count.invoices }));
}

/** Names only, for the client picker on an invoice. */
export async function listClientChoices(db: ScopedClient) {
  return prisma.client.findMany({
    where: db.where(),
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function findClient(db: ScopedClient, id: string) {
  return prisma.client.findFirst({ where: db.where({ id }), select: { id: true } });
}

export async function createClient(db: ScopedClient, input: ClientInput) {
  return prisma.client.create({
    data: { ...input, organizationId: db.organizationId },
    select: { id: true, name: true },
  });
}

/** Returns how many rows changed: 0 means the client is not in this studio. */
export async function updateClient(db: ScopedClient, id: string, input: ClientInput) {
  const result = await prisma.client.updateMany({ where: db.where({ id }), data: input });
  return result.count;
}
