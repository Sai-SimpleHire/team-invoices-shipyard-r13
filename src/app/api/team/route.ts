import type { NextRequest } from 'next/server';

import { invalidReply, serviceReply, unexpectedReply } from '@/lib/api/replies';
import { studioForRequest } from '@/lib/studio/route-context';
import { colleagueSchema } from '@/lib/team/schema';
import { addColleague } from '@/lib/team/service';
import { validateBody } from '@/seams/validate';

/** `POST /api/team` — add a colleague to the signed-in person's studio. */
export async function POST(request: NextRequest) {
  const studio = await studioForRequest();
  if (!studio.ok) return studio.response;

  const input = await validateBody(request, colleagueSchema);
  if (!input.ok) return invalidReply(input);

  try {
    return serviceReply(await addColleague(studio.db, input.data), 201);
  } catch (error) {
    return unexpectedReply('team.add', error);
  }
}
