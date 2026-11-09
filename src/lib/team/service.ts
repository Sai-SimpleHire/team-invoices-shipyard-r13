import { checkPassword, hashPassword, normaliseEmail } from '@/components/auth/password';
import { addMember } from '@/components/organization_tenancy/membership';
import { refused, type ServiceResult } from '@/lib/api/replies';
import type { ScopedClient } from '@/seams/db';

import * as queries from './queries';
import type { ColleagueInput } from './schema';

export { listMembers, type MemberRow } from './queries';

const TAKEN =
  'That email address already has an account. Each person can belong to one studio for now.';

/**
 * Add a colleague: their own account, with the starting password the owner chose, in this
 * studio. Nothing is emailed; the person adding them passes the password on.
 */
export async function addColleague(
  db: ScopedClient,
  input: ColleagueInput,
): Promise<ServiceResult<{ userId: string; name: string }>> {
  const email = normaliseEmail(input.email);
  // The sign-in part's own password rules, so a colleague's password is as strong as an owner's.
  const check = checkPassword(input.password, { email, name: input.name });
  if (!check.ok) {
    const issue = check.issues[0] ?? 'Choose a stronger starting password.';
    return refused(400, issue, { password: issue });
  }
  if (await queries.emailIsTaken(email)) return refused(409, TAKEN, { email: TAKEN });

  const user = await queries.createUser({
    name: input.name,
    email,
    passwordHash: await hashPassword(input.password),
  });
  try {
    await addMember({ organizationId: db.organizationId, userId: user.id, role: 'MEMBER' });
  } catch (error) {
    await queries.deleteUser(user.id);
    throw error;
  }
  return { ok: true, value: { userId: user.id, name: input.name } };
}
