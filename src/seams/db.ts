import { scopedWhere } from '@/components/organization_tenancy/tenancy';

/**
 * The database seam, now implemented.
 *
 * This replaced the stub that threw "this needs the Keeping customers separate
 * component". Callers of `scoped()` written before the install keep working
 * unchanged (ARCHITECTURE.md, ARC-03).
 *
 * This file declares no stub marker, and that absence is load-bearing.
 *
 * **`scoped()` does not check that the caller belongs to this organisation.**
 * It cannot: it is synchronous, and membership lives in the database. What it
 * does is make sure every query it builds is limited to the organisation you
 * name, and refuse to build one that is not.
 *
 * So where the id comes from is the whole security question, and there is
 * exactly one safe answer: `requireOrg()` from
 * `@/components/organization_tenancy/tenancy`, which checks membership and
 * hands back a context. Taking it from the URL, a form field or a header means
 * anyone can read anyone's data by changing a number — the failure this
 * component exists to prevent, reintroduced one line above the thing preventing
 * it.
 *
 *     const org = await requireOrg();
 *     if (!org.ok) return org.response;
 *     const db = scoped(org.context.organizationId);
 *     const rows = await prisma.booking.findMany({ where: db.where({ status: 'OPEN' }) });
 */

export interface ScopedClient {
  readonly organizationId: string;
  /**
   * A `where` clause that is limited to this organisation.
   *
   * Throws if the clause already names a different one, because there is no
   * safe way to choose between the two.
   */
  where<T extends Record<string, unknown>>(clause?: T): T & { organizationId: string };
}

/** The database, scoped to one organisation. Everything customer-facing uses this. */
export function scoped(organizationId: string): ScopedClient {
  const id = typeof organizationId === 'string' ? organizationId.trim() : '';
  if (!id) {
    throw new Error(
      'scoped() needs an organisation id. Pass the one from requireOrg() — never one read from the URL or the request body.',
    );
  }

  return {
    organizationId: id,
    where: <T extends Record<string, unknown>>(clause?: T) =>
      scopedWhere({ organizationId: id }, clause ?? ({} as T)),
  };
}

/**
 * The whole database, unscoped.
 *
 * Correct for seeds, migrations and genuinely single-tenant apps. Never correct
 * in a request handler once more than one customer exists.
 */
export async function unscopedClient(): Promise<unknown> {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}
