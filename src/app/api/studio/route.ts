import type { NextRequest } from 'next/server';

import { requireUser } from '@/components/auth/current-user';
import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { newStudioSchema } from '@/lib/studio/schema';
import { startStudio } from '@/lib/studio/service';
import { validateBody } from '@/seams/validate';

/** `POST /api/studio` — name the studio and yourself, straight after signing up. */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const input = await validateBody(request, newStudioSchema);
  if (!input.ok) return invalidReply(input);

  try {
    return serviceReply(await startStudio(auth.user.id, input.data), 201);
  } catch (error) {
    return unexpectedReply('studio.create', error);
  }
}
