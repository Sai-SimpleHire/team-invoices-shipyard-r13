import type { NextRequest } from 'next/server';

import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { invoiceSchema } from '@/lib/invoices/schema';
import { saveDraft } from '@/lib/invoices/service';
import { studioForRequest } from '@/lib/studio/route-context';
import { validateBody } from '@/seams/validate';

/** `PUT /api/invoices/{id}` — change a draft's client, lines and tax rate. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studio = await studioForRequest();
  if (!studio.ok) return studio.response;

  const input = await validateBody(request, invoiceSchema);
  if (!input.ok) return invalidReply(input);

  try {
    const { id } = await params;
    return serviceReply(await saveDraft(studio.db, id, input.data));
  } catch (error) {
    return unexpectedReply('invoices.update', error);
  }
}
