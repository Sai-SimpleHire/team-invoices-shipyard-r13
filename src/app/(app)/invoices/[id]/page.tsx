import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Status } from '@/components/ui_foundation/Status';
import { listClientChoices } from '@/lib/clients/service';
import { canEditLines, STATUS_LABEL, STATUS_TONE } from '@/lib/invoices/rules';
import { findInvoice } from '@/lib/invoices/service';
import { invoiceNumberLabel } from '@/lib/invoices/totals';
import { studioForPage } from '@/lib/studio/context';

import { draftFromSaved } from '../_components/draft';
import { InvoiceEditor } from '../_components/InvoiceEditor';
import { InvoiceSheet } from '../_components/InvoiceSheet';
import { StatusActions } from '../_components/StatusActions';

export const metadata: Metadata = { title: 'Invoice · Team invoices' };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const studio = await studioForPage();
  // Another studio's invoice is "not here", exactly like one that does not exist.
  const invoice = await findInvoice(studio.db, id);
  if (!invoice) notFound();
  const clients = await listClientChoices(studio.db);

  return (
    <>
      <p>
        <Link href="/invoices">Back to invoices</Link>
      </p>
      <div className="page-head">
        <h1>
          {invoiceNumberLabel(invoice.number)}
          <Status tone={STATUS_TONE[invoice.status]} label={STATUS_LABEL[invoice.status]} />
        </h1>
        <StatusActions invoiceId={invoice.id} status={invoice.status} />
      </div>
      {canEditLines(invoice.status) ? (
        <InvoiceEditor invoiceId={invoice.id} initial={draftFromSaved(invoice)} clients={clients} />
      ) : (
        <InvoiceSheet invoice={invoice} />
      )}
    </>
  );
}
