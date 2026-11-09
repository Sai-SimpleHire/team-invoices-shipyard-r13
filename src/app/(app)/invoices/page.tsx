import type { Metadata } from 'next';
import Link from 'next/link';

import { buttonProps } from '@/components/ui_foundation/primitives';
import { listClientChoices } from '@/lib/clients/service';
import { owedSummary, unpaidFirst } from '@/lib/invoices/rules';
import { listInvoices } from '@/lib/invoices/service';
import { studioForPage } from '@/lib/studio/context';

import { InvoiceTable } from './_components/InvoiceTable';
import { OwedSummary } from './_components/OwedSummary';

export const metadata: Metadata = { title: 'Invoices · Team invoices' };

export default async function InvoicesPage() {
  const studio = await studioForPage();
  const [invoices, clients] = await Promise.all([
    listInvoices(studio.db),
    listClientChoices(studio.db),
  ]);

  return (
    <>
      <div className="page-head">
        <h1>Invoices</h1>
        <Link href="/invoices/new" className={buttonProps({ tone: 'primary' }).className}>
          New invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices yet.</p>
          {clients.length === 0 ? (
            <p>
              Start by <Link href="/clients">adding a client</Link>, then create your first invoice
              for them.
            </p>
          ) : (
            <p>
              <Link href="/invoices/new">Create your first invoice</Link>.
            </p>
          )}
        </div>
      ) : (
        <>
          <OwedSummary summary={owedSummary(invoices)} />
          <InvoiceTable
            invoices={unpaidFirst(invoices).map((invoice) => ({
              ...invoice,
              createdAt: invoice.createdAt.toISOString(),
            }))}
          />
        </>
      )}
    </>
  );
}
