import type { NextRequest } from 'next/server';

import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { invoiceSchema } from '@/lib/invoices/schema';
import { createInvoice } from '@/lib/invoices/service';
import { studioForRequest } from '@/lib/studio/route-context';
import { validateBody } from '@/seams/validate';

/** `POST /api/invoices` — a new draft with the studio's next number. */
export async function POST(request: NextRequest) {
  const studio = await studioForRequest();
  if (!studio.ok) return studio.response;

  const input = await validateBody(request, invoiceSchema);
  if (!input.ok) return invalidReply(input);

  try {
    const result = await createInvoice(studio.db, {
      invoice: input.data,
      createdById: studio.context.userId,
    });
    return serviceReply(result, 201);
  } catch (error) {
    return unexpectedReply('invoices.create', error);
  }
}
