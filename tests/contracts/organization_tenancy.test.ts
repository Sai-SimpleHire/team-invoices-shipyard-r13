import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { belongsToOrg, scopedWhere } from '@/components/organization_tenancy/tenancy';
import { wouldStrandOrganization } from '@/components/organization_tenancy/membership';

import { scoped } from '@/seams/db';

/** Read as text, to check the stub marker is gone. Its absence is what stops
 *  a later install overwriting a file that now holds real behaviour. */
const seamSource = readFileSync(path.join(process.cwd(), 'src', 'seams', 'db.ts'), 'utf8');

/**
 * The contract for keeping customers apart.
 *
 * Every case here is a rehearsal of the same accident: a query that runs
 * without knowing which organisation it is for. The component's promise is that
 * such a query fails loudly rather than returning everybody's rows, and these
 * are the tests that hold it to that.
 */

const context = { organizationId: 'org_1' };

describe('scoping a query', () => {
  it('adds the organisation to the filter', () => {
    expect(scopedWhere(context, { status: 'open' })).toEqual({
      status: 'open',
      organizationId: 'org_1',
    });
  });

  it('works with no other conditions', () => {
    expect(scopedWhere(context)).toEqual({ organizationId: 'org_1' });
  });

  it('refuses when there is no organisation at all', () => {
    expect(() => scopedWhere(undefined)).toThrow(/not limited to one organisation/);
  });

  it('refuses an empty organisation id', () => {
    expect(() => scopedWhere({ organizationId: '' })).toThrow(/not limited to one organisation/);
  });

  it('refuses a query that names a different organisation', () => {
    // This is the shape of a real attack: the caller is signed in to org_1 and
    // has passed org_2 in the request body.
    expect(() => scopedWhere(context, { organizationId: 'org_2' })).toThrow(/different organisation/);
  });

  it('allows the same organisation stated twice', () => {
    expect(scopedWhere(context, { organizationId: 'org_1' })).toEqual({ organizationId: 'org_1' });
  });

  it('never returns a filter without an organisation', () => {
    const filter = scopedWhere(context, { archived: false });
    expect(filter.organizationId).toBe('org_1');
    expect(Object.keys(filter)).toContain('organizationId');
  });
});

describe('acting on a record by id', () => {
  it('accepts one that belongs to the caller', () => {
    expect(belongsToOrg({ organizationId: 'org_1' }, context)).toBe(true);
  });

  it('rejects one that belongs to somebody else', () => {
    expect(belongsToOrg({ organizationId: 'org_2' }, context)).toBe(false);
  });

  it('rejects a record that was not found', () => {
    expect(belongsToOrg(null, context)).toBe(false);
  });

  it('rejects a record with no organisation on it', () => {
    expect(belongsToOrg({ organizationId: null }, context)).toBe(false);
  });
});

describe('the last owner', () => {
  it('cannot be removed', () => {
    expect(wouldStrandOrganization({ role: 'OWNER', remainingOwners: 1 })).toBe(true);
  });

  it('can be removed once there is another', () => {
    expect(wouldStrandOrganization({ role: 'OWNER', remainingOwners: 2 })).toBe(false);
  });

  it('does not apply to ordinary members', () => {
    expect(wouldStrandOrganization({ role: 'MEMBER', remainingOwners: 1 })).toBe(false);
  });
});

describe('the database seam, once this component fills it', () => {
  /**
   * Before the install, `scoped()` threw "this needs the Keeping customers
   * separate component". After it, the same call has to actually scope — and
   * the failure that matters is the quiet one, where a query runs across every
   * customer's rows and looks exactly like working software.
   */
  it('refuses to build a clause without an organisation', () => {
    expect(() => scoped('')).toThrow(/organisation id/i);
    expect(() => scoped('   ')).toThrow(/organisation id/i);
  });

  it('limits every clause it builds to the organisation it was given', () => {
    const db = scoped('org_1');
    expect(db.where({ status: 'OPEN' })).toEqual({ status: 'OPEN', organizationId: 'org_1' });
    expect(db.where()).toEqual({ organizationId: 'org_1' });
  });

  it('refuses a clause that names a different organisation rather than picking one', () => {
    // There is no safe interpretation of being told two different tenants, so
    // preferring either of them silently is worse than stopping.
    expect(() => scoped('org_1').where({ organizationId: 'org_2' })).toThrow();
  });

  it('no longer advertises itself as a stub', () => {
    // The marker's absence is what stops a later install overwriting a file
    // that now holds real behaviour.
    expect(seamSource).not.toContain('SHIPYARD_SEAM_STUB');
  });
});
