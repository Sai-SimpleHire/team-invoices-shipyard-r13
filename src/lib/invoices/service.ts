import { refused, type ServiceResult } from '@/lib/api/replies';
import { findClient } from '@/lib/clients/queries';
import type { ScopedClient } from '@/seams/db';

import { priceInvoice } from './pricing';
import * as queries from './queries';
import { canEditLines, canMoveTo, type InvoiceStatus } from './rules';
import type { InvoiceInput } from './schema';

export { findInvoice, listInvoices, type InvoiceDetail, type InvoiceListRow } from './queries';

const NO_CLIENT = refused(400, 'Choose one of your clients.', {
  clientId: 'Choose one of your clients.',
});
const NOT_FOUND = refused(404, 'That invoice could not be found.');
const STATUS_WORD: Record<InvoiceStatus, string> = { DRAFT: 'a draft', SENT: 'sent', PAID: 'paid' };

export async function createInvoice(
  db: ScopedClient,
  input: { invoice: InvoiceInput; createdById: string },
): Promise<ServiceResult<{ id: string; number: number }>> {
  // The client must be this studio's own; an id from another studio is treated as unknown.
  if (!(await findClient(db, input.invoice.clientId))) return NO_CLIENT;
  const created = await queries.createInvoice(db, {
    invoice: priceInvoice(input.invoice),
    createdById: input.createdById,
  });
  return { ok: true, value: created };
}

export async function saveDraft(
  db: ScopedClient,
  id: string,
  input: InvoiceInput,
): Promise<ServiceResult<{ id: string }>> {
  const existing = await queries.findInvoice(db, id);
  if (!existing) return NOT_FOUND;
  if (!canEditLines(existing.status)) {
    return refused(409, 'This invoice has been sent, so its lines can no longer change.');
  }
  if (!(await findClient(db, input.clientId))) return NO_CLIENT;
  const changed = await queries.replaceDraft(db, id, priceInvoice(input));
  if (changed === 0) return refused(409, 'Someone else changed this invoice. Reload to see it.');
  return { ok: true, value: { id } };
}

export async function changeStatus(
  db: ScopedClient,
  input: { id: string; to: InvoiceStatus },
): Promise<ServiceResult<{ id: string; status: InvoiceStatus }>> {
  const existing = await queries.findInvoice(db, input.id);
  if (!existing) return NOT_FOUND;
  if (!canMoveTo(existing.status, input.to)) {
    const now = STATUS_WORD[existing.status];
    return refused(409, `This invoice is ${now}, so it cannot be marked ${STATUS_WORD[input.to]}.`);
  }
  const changed = await queries.moveStatus(db, {
    id: input.id,
    from: existing.status,
    to: input.to,
  });
  if (changed === 0) return refused(409, 'Someone else changed this invoice. Reload to see it.');
  return { ok: true, value: { id: input.id, status: input.to } };
}
