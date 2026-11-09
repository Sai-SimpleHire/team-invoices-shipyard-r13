'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { buttonProps } from '@/components/ui_foundation/primitives';
import { newStudioSchema } from '@/lib/studio/schema';
import { sendJson } from '@/lib/ui/send';
import { TextField } from '@/lib/ui/TextField';
import { validate } from '@/seams/validate';

export function StudioNameForm() {
  const router = useRouter();
  const [values, setValues] = useState({ studioName: '', yourName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  const errorFor = (key: string) => (errors[key] ? { error: errors[key] } : {});

  async function createStudio(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const checked = validate(newStudioSchema, values);
    if (!checked.ok) {
      setErrors(checked.fieldErrors);
      return;
    }
    setIsBusy(true);
    setErrors({});
    setProblem(null);
    const result = await sendJson('/api/studio', { method: 'POST', body: checked.data });
    if (!result.ok) {
      setIsBusy(false);
      setErrors(result.fieldErrors);
      setProblem(result.message);
      return;
    }
    router.refresh();
    router.push('/invoices');
  }

  return (
    <form className="stack-form" onSubmit={createStudio} noValidate>
      {problem ? (
        <p className="notice-error" role="alert">
          {problem}
        </p>
      ) : null}
      <TextField
        label="Studio name"
        name="studioName"
        value={values.studioName}
        onChange={set('studioName')}
        hint="This is how your team will see it."
        autoComplete="organization"
        {...errorFor('studioName')}
      />
      <TextField
        label="Your name"
        name="yourName"
        value={values.yourName}
        onChange={set('yourName')}
        autoComplete="name"
        {...errorFor('yourName')}
      />
      <button {...buttonProps({ tone: 'primary', busy: isBusy })} type="submit">
        {isBusy ? 'Creating your studio…' : 'Create studio'}
      </button>
    </form>
  );
}
