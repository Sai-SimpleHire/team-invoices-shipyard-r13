import type { Metadata } from 'next';

import { studioForPage } from '@/lib/studio/context';
import { listMembers } from '@/lib/team/service';

import { TeamView } from './_components/TeamView';

export const metadata: Metadata = { title: 'Team · Team invoices' };

export default async function TeamPage() {
  const studio = await studioForPage();
  const members = await listMembers(studio.db);
  return (
    <TeamView
      members={members.map((member) => ({ ...member, joinedAt: member.joinedAt.toISOString() }))}
    />
  );
}
