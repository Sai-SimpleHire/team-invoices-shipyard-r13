import { createOrganization } from '@/components/organization_tenancy/membership';
import { refused, type ServiceResult } from '@/lib/api/replies';

import { hasStudio, setPersonName } from './queries';
import type { NewStudioInput } from './schema';

/**
 * Start a studio for someone who has just signed up, with them as its owner. One studio per
 * person in this version, so a second attempt is refused rather than making another.
 */
export async function startStudio(
  userId: string,
  input: NewStudioInput,
): Promise<ServiceResult<{ id: string }>> {
  if (await hasStudio(userId)) return refused(409, 'You already belong to a studio.');
  await setPersonName(userId, input.yourName);
  const studio = await createOrganization({ name: input.studioName, ownerUserId: userId });
  return { ok: true, value: { id: studio.id } };
}
