'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui_foundation/Button';
import { nextStatus, type InvoiceStatus } from '@/lib/invoices/rules';
import { sendJson } from '@/lib/ui/send';

const ACTION: Record<InvoiceStatus, string> = {
  DRAFT: '',
  SENT: 'Mark as sent',
  PAID: 'Mark as paid',
};

/** Move the invoice on: a draft to sent, a sent invoice to paid. Nothing once it is paid. */
export function StatusActions({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const next = nextStatus(status);
  if (!next) return null;

  async function moveOn(to: InvoiceStatus): Promise<void> {
    setIsBusy(true);
    setProblem(null);
    const result = await sendJson(`/api/invoices/${invoiceId}/status`, {
      method: 'POST',
      body: { status: to },
    });
    setIsBusy(false);
    if (!result.ok) {
      setProblem(result.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="form-actions invoice-status-actions">
      <Button
        tone={status === 'SENT' ? 'primary' : 'quiet'}
        busy={isBusy}
        onClick={() => moveOn(next)}
      >
        {isBusy ? 'Saving…' : ACTION[next]}
      </Button>
      {status === 'DRAFT' ? (
        <span className="field-hint">Save any changes first; a sent invoice cannot change.</span>
      ) : null}
      {problem ? (
        <p className="field-error" role="alert">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
