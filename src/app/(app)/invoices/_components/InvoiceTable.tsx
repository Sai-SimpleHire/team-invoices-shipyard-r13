'use client';

import Link from 'next/link';

import { DataTable } from '@/components/data_table/DataTable';
import { Status } from '@/components/ui_foundation/Status';
import { STATUS_LABEL, STATUS_TONE, type InvoiceStatus } from '@/lib/invoices/rules';
import { formatMoney, invoiceNumberLabel, minorToText } from '@/lib/invoices/totals';
import { Cell } from '@/lib/ui/cell';

export interface InvoiceListItem {
  id: string;
  number: number;
  status: InvoiceStatus;
  totalMinor: number;
  clientName: string;
  /** ISO time; shown as a date in the reader's own time zone. */
  createdAt: string;
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Every invoice, in the order given (unpaid first); the reader can re-sort any column. */
export function InvoiceTable({ invoices }: { invoices: InvoiceListItem[] }) {
  const rows = invoices.map((invoice) => {
    const label = invoiceNumberLabel(invoice.number);
    const created = new Date(invoice.createdAt);
    return {
      number: new Cell(label, <Link href={`/invoices/${invoice.id}`}>{label}</Link>),
      client: invoice.clientName,
      status: new Cell(
        STATUS_LABEL[invoice.status],
        <Status tone={STATUS_TONE[invoice.status]} label={STATUS_LABEL[invoice.status]} />,
      ),
      total: new Cell(
        minorToText(invoice.totalMinor),
        <span className="amount">{formatMoney(invoice.totalMinor)}</span>,
      ),
      created: new Cell(
        invoice.createdAt,
        <span suppressHydrationWarning>{DATE.format(created)}</span>,
      ),
    };
  });

  return (
    <DataTable
      caption="Every invoice, unpaid first"
      rows={rows}
      columns={[
        { key: 'number', label: 'Number' },
        { key: 'client', label: 'Client' },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Total' },
        { key: 'created', label: 'Created' },
      ]}
    />
  );
}
