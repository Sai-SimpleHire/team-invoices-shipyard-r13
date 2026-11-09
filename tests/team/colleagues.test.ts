import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Adding a colleague to a studio. No database here: the client is replaced and checked. */

const db = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 'new-user', name: 'Ada', email: 'ada@studio.test' }),
    delete: vi.fn().mockResolvedValue({}),
  },
  membership: {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { colleagueSchema } from '@/lib/team/schema';
import { addColleague, listMembers } from '@/lib/team/service';
import { scoped } from '@/seams/db';
import { validate } from '@/seams/validate';

const studioA = scoped('studio-a');
const ada = { name: 'Ada Lovelace', email: ' Ada@Studio.test ', password: 'Quiet-Harbour-71' };

beforeEach(() => vi.clearAllMocks());

describe('adding a colleague', () => {
  it('creates their account with a hashed password and puts them in this studio', async () => {
    const result = await addColleague(studioA, ada);
    expect(result).toEqual({ ok: true, value: { userId: 'new-user', name: 'Ada Lovelace' } });

    const created = db.user.create.mock.calls[0]?.[0].data;
    expect(created.email).toBe('ada@studio.test');
    expect(created.passwordHash).not.toContain('Quiet-Harbour-71');

    expect(db.membership.upsert.mock.calls[0]?.[0].create).toEqual({
      organizationId: 'studio-a',
      userId: 'new-user',
      role: 'MEMBER',
    });
  });

  it('refuses a weak starting password before creating anything', async () => {
    const result = await addColleague(studioA, { ...ada, password: 'aaaaaaaaaaaa' });
    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(result.ok ? {} : result.fieldErrors).toHaveProperty('password');
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('refuses an address that already has an account', async () => {
    db.user.findUnique.mockResolvedValueOnce({ id: 'someone' });
    const result = await addColleague(studioA, ada);
    expect(result).toMatchObject({ ok: false, status: 409 });
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('leaves no account behind when joining the studio fails', async () => {
    db.membership.upsert.mockRejectedValueOnce(new Error('database went away'));
    await expect(addColleague(studioA, ada)).rejects.toThrow();
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: 'new-user' } });
  });

  it('checks the form the same way in the browser', () => {
    expect(validate(colleagueSchema, ada).ok).toBe(true);
    const result = validate(colleagueSchema, { name: '', email: 'no', password: 'short' });
    expect(result.ok ? [] : Object.keys(result.fieldErrors)).toEqual(['name', 'email', 'password']);
  });
});

describe('the team list', () => {
  it('lists only the people in this studio', async () => {
    db.membership.findMany.mockResolvedValueOnce([
      { userId: 'u1', createdAt: new Date('2026-11-01T10:00:00Z') },
    ]);
    db.user.findMany.mockResolvedValueOnce([{ id: 'u1', name: 'Sam', email: 'sam@studio.test' }]);
    const members = await listMembers(studioA);
    expect(db.membership.findMany.mock.calls[0]?.[0].where).toEqual({
      organizationId: 'studio-a',
    });
    expect(members).toEqual([
      {
        userId: 'u1',
        name: 'Sam',
        email: 'sam@studio.test',
        joinedAt: new Date('2026-11-01T10:00:00Z'),
      },
    ]);
  });
});
