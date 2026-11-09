import { refused, type ServiceResult } from '@/lib/api/replies';
import type { ScopedClient } from '@/seams/db';

import * as queries from './queries';
import type { ClientInput } from './schema';

export { listClients, listClientChoices, type ClientRow } from './queries';

export async function addClient(
  db: ScopedClient,
  input: ClientInput,
): Promise<ServiceResult<{ id: string; name: string }>> {
  const client = await queries.createClient(db, input);
  return { ok: true, value: client };
}

export async function changeClient(
  db: ScopedClient,
  id: string,
  input: ClientInput,
): Promise<ServiceResult<{ id: string }>> {
  const changed = await queries.updateClient(db, id, input);
  // Another studio's client and a client that does not exist get the same answer.
  if (changed === 0) return refused(404, 'That client could not be found.');
  return { ok: true, value: { id } };
}
