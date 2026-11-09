import { formatMoney, type InvoiceTotals } from '@/lib/invoices/totals';

/**
 * Subtotal, tax and total, bottom right as on a printed invoice. With `onTaxRateChange` the
 * tax rate is a field; without it (a sent invoice) it is plain text.
 */
export function TotalsBlock({
  totals,
  taxRate,
  onTaxRateChange,
  taxRateError,
}: {
  totals: InvoiceTotals;
  taxRate: string;
  onTaxRateChange?: (taxRate: string) => void;
  taxRateError?: string;
}) {
  return (
    <div className="invoice-totals">
      {onTaxRateChange ? (
        <div className="form-field invoice-tax-rate">
          <label htmlFor="invoice-tax-rate">Tax rate (%)</label>
          <input
            id="invoice-tax-rate"
            value={taxRate}
            inputMode="decimal"
            onChange={(event) => onTaxRateChange(event.target.value)}
            {...(taxRateError
              ? { 'aria-invalid': true, 'aria-describedby': 'invoice-tax-rate-error' }
              : {})}
          />
          {taxRateError ? (
            <p className="field-error" id="invoice-tax-rate-error">
              {taxRateError}
            </p>
          ) : null}
        </div>
      ) : null}
      <dl>
        <dt>Subtotal</dt>
        <dd className="amount">{formatMoney(totals.subtotalMinor)}</dd>
        <dt>Tax ({taxRate || '0'}%)</dt>
        <dd className="amount">{formatMoney(totals.taxMinor)}</dd>
        <dt className="invoice-grand">Total</dt>
        <dd className="amount invoice-grand">{formatMoney(totals.totalMinor)}</dd>
      </dl>
    </div>
  );
}
