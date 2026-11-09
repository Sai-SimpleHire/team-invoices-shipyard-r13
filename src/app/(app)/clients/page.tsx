import type { Metadata } from 'next';

import { listClients } from '@/lib/clients/service';
import { studioForPage } from '@/lib/studio/context';

import { ClientsView } from './_components/ClientsView';

export const metadata: Metadata = { title: 'Clients · Team invoices' };

export default async function ClientsPage() {
  const studio = await studioForPage();
  const clients = await listClients(studio.db);
  return <ClientsView clients={clients} />;
}
