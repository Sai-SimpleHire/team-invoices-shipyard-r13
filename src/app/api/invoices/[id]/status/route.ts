import type { NextRequest } from 'next/server';

import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { statusChangeSchema } from '@/lib/invoices/schema';
import { changeStatus } from '@/lib/invoices/service';
import { studioForRequest } from '@/lib/studio/route-context';
import { validateBody } from '@/seams/validate';

/** `POST /api/invoices/{id}/status` — mark an invoice as sent, or as paid. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studio = await studioForRequest();
  if (!studio.ok) return studio.response;

  const input = await validateBody(request, statusChangeSchema);
  if (!input.ok) return invalidReply(input);

  try {
    const { id } = await params;
    return serviceReply(await changeStatus(studio.db, { id, to: input.data.status }));
  } catch (error) {
    return unexpectedReply('invoices.status', error);
  }
}
