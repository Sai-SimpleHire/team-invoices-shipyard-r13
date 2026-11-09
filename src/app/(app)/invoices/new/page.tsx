import type { Metadata } from 'next';
import Link from 'next/link';

import { listClientChoices } from '@/lib/clients/service';
import { studioForPage } from '@/lib/studio/context';

import { newDraft } from '../_components/draft';
import { InvoiceEditor } from '../_components/InvoiceEditor';

export const metadata: Metadata = { title: 'New invoice · Team invoices' };

export default async function NewInvoicePage() {
  const studio = await studioForPage();
  const clients = await listClientChoices(studio.db);

  return (
    <>
      <p>
        <Link href="/invoices">Back to invoices</Link>
      </p>
      <div className="page-head">
        <h1>New invoice</h1>
      </div>
      {clients.length === 0 ? (
        <div className="empty-state">
          <p>
            An invoice is for one of your clients, and you have none yet.{' '}
            <Link href="/clients">Add a client first</Link>.
          </p>
        </div>
      ) : (
        <>
          <p className="page-lede">
            It gets the studio&apos;s next invoice number when you create it.
          </p>
          <InvoiceEditor
            invoiceId={null}
            initial={newDraft(clients.length === 1 ? (clients[0]?.id ?? '') : '')}
            clients={clients}
          />
        </>
      )}
    </>
  );
}
