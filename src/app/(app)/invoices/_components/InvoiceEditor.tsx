'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { buttonProps } from '@/components/ui_foundation/primitives';
import { invoiceSchema } from '@/lib/invoices/schema';
import { sendJson } from '@/lib/ui/send';
import { validate } from '@/seams/validate';

import { ClientPicker } from './ClientPicker';
import { draftToInput, liveTotals, type DraftInvoice } from './draft';
import { LineItemsEditor } from './LineItemsEditor';
import { TotalsBlock } from './TotalsBlock';

import './invoice.css';

/** Create a draft invoice, or change one. Totals update as they type; the server works them out
 * again when it saves. */
export function InvoiceEditor({
  invoiceId,
  initial,
  clients,
}: {
  invoiceId: string | null;
  initial: DraftInvoice;
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  function change(next: DraftInvoice): void {
    setDraft(next);
    setIsSaved(false);
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const checked = validate(invoiceSchema, draftToInput(draft));
    if (!checked.ok) {
      setErrors(checked.fieldErrors);
      setProblem('Some details need changing before this can be saved.');
      return;
    }
    setIsBusy(true);
    setErrors({});
    setProblem(null);
    const result = await sendJson<{ id: string }>(
      invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices',
      { method: invoiceId ? 'PUT' : 'POST', body: checked.data },
    );
    setIsBusy(false);
    if (!result.ok) {
      setErrors(result.fieldErrors);
      setProblem(result.message);
      return;
    }
    if (!invoiceId) {
      router.push(`/invoices/${result.data.id}`);
      return;
    }
    setIsSaved(true);
    router.refresh();
  }

  return (
    <form className="stack-form invoice-sheet" onSubmit={save} noValidate>
      {problem ? (
        <p className="notice-error" role="alert">
          {problem}
        </p>
      ) : null}
      <ClientPicker
        clients={clients}
        value={draft.clientId}
        onChange={(clientId) => change({ ...draft, clientId })}
        {...(errors.clientId ? { error: errors.clientId } : {})}
      />
      <LineItemsEditor draft={draft} errors={errors} onChange={change} />
      <TotalsBlock
        totals={liveTotals(draft)}
        taxRate={draft.taxRate}
        onTaxRateChange={(taxRate) => change({ ...draft, taxRate })}
        {...(errors.taxRate ? { taxRateError: errors.taxRate } : {})}
      />
      <div className="form-actions">
        <button {...buttonProps({ tone: 'primary', busy: isBusy })} type="submit">
          {isBusy ? 'Saving…' : invoiceId ? 'Save draft' : 'Create invoice'}
        </button>
        {isSaved ? <span role="status">Saved.</span> : null}
      </div>
    </form>
  );
}
