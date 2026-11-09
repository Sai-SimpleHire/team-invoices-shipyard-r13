'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Dialog } from '@/components/ui_blocks/Dialog';
import { Button } from '@/components/ui_foundation/Button';
import { buttonProps } from '@/components/ui_foundation/primitives';
import { colleagueSchema } from '@/lib/team/schema';
import { sendJson } from '@/lib/ui/send';
import { TextField } from '@/lib/ui/TextField';
import { validate } from '@/seams/validate';

const PASSWORD_HINT =
  'At least 12 characters, mixing three of: small letters, capitals, numbers, symbols. ' +
  'Tell them this password yourself; nothing is emailed.';

/** Add a colleague with a starting password. They sign in with it straight away. */
export function ColleagueDialog({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (name: string) => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  const errorFor = (key: string) => (errors[key] ? { error: errors[key] } : {});

  async function add(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const checked = validate(colleagueSchema, values);
    if (!checked.ok) {
      setErrors(checked.fieldErrors);
      return;
    }
    setIsBusy(true);
    setErrors({});
    setProblem(null);
    const result = await sendJson('/api/team', { method: 'POST', body: checked.data });
    setIsBusy(false);
    if (!result.ok) {
      setErrors(result.fieldErrors);
      if (Object.keys(result.fieldErrors).length === 0) setProblem(result.message);
      return;
    }
    router.refresh();
    onAdded(checked.data.name);
  }

  return (
    <Dialog kind="form" title="Add a colleague" onClose={onClose}>
      <form className="stack-form" onSubmit={add} noValidate>
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
          autoComplete="off"
          value={values.email}
          onChange={set('email')}
          {...errorFor('email')}
        />
        <TextField
          label="Starting password"
          name="password"
          type="text"
          autoComplete="off"
          value={values.password}
          onChange={set('password')}
          hint={PASSWORD_HINT}
          {...errorFor('password')}
        />
        <div className="form-actions">
          <button {...buttonProps({ tone: 'primary', busy: isBusy })} type="submit">
            {isBusy ? 'Adding…' : 'Add to studio'}
          </button>
          <Button tone="quiet" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
