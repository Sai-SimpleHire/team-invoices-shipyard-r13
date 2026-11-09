'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Dialog } from '@/components/ui_blocks/Dialog';
import { Button } from '@/components/ui_foundation/Button';
import { buttonProps } from '@/components/ui_foundation/primitives';
import type { ClientRow } from '@/lib/clients/queries';
import { clientSchema } from '@/lib/clients/schema';
import { sendJson } from '@/lib/ui/send';
import { TextField } from '@/lib/ui/TextField';
import { validate } from '@/seams/validate';

/** Add a client, or change one. The same fields and checks either way. */
export function ClientDialog({
  client,
  onClose,
}: {
  client: ClientRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: client?.name ?? '',
    email: client?.email ?? '',
    address: client?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const checked = validate(clientSchema, values);
    if (!checked.ok) {
      setErrors(checked.fieldErrors);
      return;
    }
    setIsBusy(true);
    setErrors({});
    setProblem(null);
    const result = await sendJson(client ? `/api/clients/${client.id}` : '/api/clients', {
      method: client ? 'PUT' : 'POST',
      body: checked.data,
    });
    setIsBusy(false);
    if (!result.ok) {
      setErrors(result.fieldErrors);
      setProblem(result.message);
      return;
    }
    router.refresh();
    onClose();
  }

  const errorFor = (key: string) => (errors[key] ? { error: errors[key] } : {});

  return (
    <Dialog kind="form" title={client ? `Edit ${client.name}` : 'Add a client'} onClose={onClose}>
      <form className="stack-form" onSubmit={save} noValidate>
        {problem ? (
          <p className="notice-error" role="alert">
            {problem}
          </p>
        ) : null}
        <TextField
          label="Name"
          name="name"
          value={values.name}
          onChange={set('name')}
          {...errorFor('name')}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={set('email')}
          {...errorFor('email')}
        />
        <TextField
          label="Address"
          name="address"
          value={values.address}
          isMultiline
          onChange={set('address')}
          {...errorFor('address')}
        />
        <div className="form-actions">
          <button {...buttonProps({ tone: 'primary', busy: isBusy })} type="submit">
            {isBusy ? 'Saving…' : 'Save client'}
          </button>
          <Button tone="quiet" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
