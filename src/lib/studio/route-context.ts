import type { NextResponse } from 'next/server';

import { requireOrg, type OrgContext } from '@/components/organization_tenancy/tenancy';
import { scoped, type ScopedClient } from '@/seams/db';

export type StudioRequest =
  { ok: true; context: OrgContext; db: ScopedClient } | { ok: false; response: NextResponse };

/**
 * Who is asking and for which studio, for an API route. Membership is checked in the database
 * every time; the studio is never taken from what the browser sent.
 */
export async function studioForRequest(): Promise<StudioRequest> {
  const org = await requireOrg();
  if (!org.ok) return org;
  return { ok: true, context: org.context, db: scoped(org.context.organizationId) };
}
