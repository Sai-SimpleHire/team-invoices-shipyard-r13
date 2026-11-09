import type { NextRequest } from 'next/server';

import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { clientSchema } from '@/lib/clients/schema';
import { changeClient } from '@/lib/clients/service';
import { studioForRequest } from '@/lib/studio/route-context';
import { validateBody } from '@/seams/validate';

/** `PUT /api/clients/{id}` — change one of the studio's clients. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studio = await studioForRequest();
  if (!studio.ok) return studio.response;

  const input = await validateBody(request, clientSchema);
  if (!input.ok) return invalidReply(input);

  try {
    const { id } = await params;
    return serviceReply(await changeClient(studio.db, id, input.data));
  } catch (error) {
    return unexpectedReply('clients.update', error);
  }
}
