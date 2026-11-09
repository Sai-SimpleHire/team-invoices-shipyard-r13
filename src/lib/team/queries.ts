import { prisma } from '@/lib/prisma';
import type { ScopedClient } from '@/seams/db';

export interface MemberRow {
  userId: string;
  name: string;
  email: string;
  joinedAt: Date;
}

/** The people in this studio. Users belong to the sign-in part, so they are joined by id. */
export async function listMembers(db: ScopedClient): Promise<MemberRow[]> {
  const memberships = await prisma.membership.findMany({
    where: db.where(),
    orderBy: { createdAt: 'asc' },
    select: { userId: true, createdAt: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: memberships.map((membership) => membership.userId) } },
    select: { id: true, name: true, email: true },
  });
  const byId = new Map(users.map((user) => [user.id, user]));
  return memberships.flatMap((membership) => {
    const user = byId.get(membership.userId);
    if (!user) return [];
    return [
      {
        userId: user.id,
        name: user.name ?? '',
        email: user.email,
        joinedAt: membership.createdAt,
      },
    ];
  });
}

export async function emailIsTaken(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user !== null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }) {
  return prisma.user.create({ data: input, select: { id: true, name: true, email: true } });
}

/** Undo a half-made colleague, so a failed add leaves no account behind. */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}
