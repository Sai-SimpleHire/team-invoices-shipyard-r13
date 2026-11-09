import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Naming a studio straight after sign-up. No database here: the client is replaced. */

const db = vi.hoisted(() => {
  const client = {
    membership: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
    user: { update: vi.fn().mockResolvedValue({}) },
    organization: { create: vi.fn().mockResolvedValue({ id: 'studio-1', name: 'Fern' }) },
    $transaction: vi.fn(),
  };
  client.$transaction.mockImplementation((work: (tx: unknown) => unknown) => work(client));
  return client;
});

vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { newStudioSchema } from '@/lib/studio/schema';
import { startStudio } from '@/lib/studio/service';
import { validate } from '@/seams/validate';

beforeEach(() => vi.clearAllMocks());

describe('starting a studio', () => {
  it('saves the owner name and makes them the owner of the new studio', async () => {
    const result = await startStudio('u1', { studioName: 'Fern', yourName: 'Alex' });
    expect(result).toEqual({ ok: true, value: { id: 'studio-1' } });
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { name: 'Alex' } });
    expect(db.membership.create.mock.calls[0]?.[0].data).toEqual({
      organizationId: 'studio-1',
      userId: 'u1',
      role: 'OWNER',
    });
  });

  it('refuses a second studio for someone who already has one', async () => {
    db.membership.findFirst.mockResolvedValueOnce({ id: 'm1' });
    const result = await startStudio('u1', { studioName: 'Again', yourName: 'Alex' });
    expect(result).toMatchObject({ ok: false, status: 409 });
    expect(db.organization.create).not.toHaveBeenCalled();
  });

  it('needs both names', () => {
    const result = validate(newStudioSchema, { studioName: ' ', yourName: '' });
    expect(result.ok ? [] : Object.keys(result.fieldErrors)).toEqual(['studioName', 'yourName']);
  });
});
