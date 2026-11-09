import { cache } from 'react';
import { redirect } from 'next/navigation';

import { currentUser } from '@/components/auth/current-user';
import { requireOrg, type OrgContext } from '@/components/organization_tenancy/tenancy';
import { scoped, type ScopedClient } from '@/seams/db';

import { studioName } from './queries';

export interface StudioPage {
  context: OrgContext;
  db: ScopedClient;
  studioName: string;
  personName: string;
}

/**
 * The studio a page is showing, for a person who is signed in and belongs to one.
 *
 * Anyone else is sent where they can get on: to sign in, or to name their studio. Cached per
 * request so the frame and the page share one lookup.
 */
export const studioForPage = cache(async (): Promise<StudioPage> => {
  const org = await requireOrg();
  if (!org.ok) {
    // 401: nobody signed in. 403: signed in, but in no studio yet.
    redirect(org.response.status === 403 ? '/welcome' : '/sign-in');
  }
  const user = await currentUser();
  const name = await studioName(org.context.organizationId);
  return {
    context: org.context,
    db: scoped(org.context.organizationId),
    studioName: name ?? 'Your studio',
    personName: user?.name ?? user?.email ?? '',
  };
});
