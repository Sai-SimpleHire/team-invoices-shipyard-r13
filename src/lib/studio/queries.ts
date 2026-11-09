import { prisma } from '@/lib/prisma';

/** The studio's name. The id comes from requireOrg(), never from the request. */
export async function studioName(organizationId: string): Promise<string | null> {
  const studio = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });
  return studio?.name ?? null;
}

/** The signed-in person's own name, shown on the Team list and in the top bar. */
export async function setPersonName(userId: string, name: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { name } });
}

/** Whether this person already belongs to a studio. */
export async function hasStudio(userId: string): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { id: true },
  });
  return membership !== null;
}
