'use client';

import { useId } from 'react';

/** A labelled field with its hint and its error attached, so a screen reader reads all three. */
export function TextField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  isMultiline = false,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: 'text' | 'email' | 'password';
  isMultiline?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');
  const shared = {
    id,
    name,
    value,
    ...(autoComplete ? { autoComplete } : {}),
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    ...(error ? { 'aria-invalid': true as const } : {}),
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {isMultiline ? (
        <textarea {...shared} rows={3} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...shared} type={type} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
