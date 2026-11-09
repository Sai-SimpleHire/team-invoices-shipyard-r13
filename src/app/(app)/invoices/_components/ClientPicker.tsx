'use client';

import Link from 'next/link';
import { useId } from 'react';

/** Who the invoice is for. With no clients yet, the way to add one instead of an empty list. */
export function ClientPicker({
  clients,
  value,
  onChange,
  error,
}: {
  clients: { id: string; name: string }[];
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
}) {
  const id = useId();

  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <p>
          An invoice is for one of your clients, and you have none yet.{' '}
          <Link href="/clients">Add a client first</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="form-field invoice-client">
      <label htmlFor={id}>Client</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...(error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {})}
      >
        <option value="">Choose a client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
