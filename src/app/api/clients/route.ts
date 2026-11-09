import type { NextRequest } from 'next/server';

import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { clientSchema } from '@/lib/clients/schema';
import { addClient } from '@/lib/clients/service';
import { studioForRequest } from '@/lib/studio/route-context';
import { validateBody } from '@/seams/validate';

/** `POST /api/clients` — add a client to the signed-in person's studio. */
export async function POST(request: NextRequest) {
  const studio = await studioForRequest();
  if (!studio.ok) return studio.response;

  const input = await validateBody(request, clientSchema);
  if (!input.ok) return invalidReply(input);

  try {
    return serviceReply(await addClient(studio.db, input.data), 201);
  } catch (error) {
    return unexpectedReply('clients.create', error);
  }
}
