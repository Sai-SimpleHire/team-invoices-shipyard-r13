import type { InvoiceDetail } from '@/lib/invoices/queries';
import { formatMoney, hundredthsToText } from '@/lib/invoices/totals';

import { TotalsBlock } from './TotalsBlock';

import './invoice.css';

/** A sent or paid invoice, read-only: it has gone to the client, so it no longer changes. */
export function InvoiceSheet({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <div className="invoice-sheet">
      <p className="page-lede">This invoice has been sent, so its lines can no longer change.</p>
      <p>
        <span className="field-hint">Client</span>
        <br />
        <strong>{invoice.client.name}</strong>
      </p>
      <table className="invoice-read-lines">
        <caption className="ui-visually-hidden">Lines on this invoice</caption>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Quantity</th>
            <th scope="col">Unit price</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.id}>
              <td>{line.description}</td>
              <td className="amount">{hundredthsToText(line.quantityHundredths)}</td>
              <td className="amount">{formatMoney(line.unitPriceMinor)}</td>
              <td className="amount">{formatMoney(line.amountMinor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <TotalsBlock
        taxRate={hundredthsToText(invoice.taxRateBasisPoints)}
        totals={{
          lineAmountsMinor: invoice.lines.map((line) => line.amountMinor),
          subtotalMinor: invoice.subtotalMinor,
          taxMinor: invoice.taxMinor,
          totalMinor: invoice.totalMinor,
        }}
      />
    </div>
  );
}
