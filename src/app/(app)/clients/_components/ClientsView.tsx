'use client';

import { useState } from 'react';

import { DataTable } from '@/components/data_table/DataTable';
import { Button } from '@/components/ui_foundation/Button';
import type { ClientRow } from '@/lib/clients/queries';
import { Cell } from '@/lib/ui/cell';

import { ClientDialog } from './ClientDialog';

type Editing = { mode: 'new' } | { mode: 'edit'; client: ClientRow } | null;

export function ClientsView({ clients }: { clients: ClientRow[] }) {
  const [editing, setEditing] = useState<Editing>(null);

  const rows = clients.map((client) => ({
    name: client.name,
    email: client.email,
    address: client.address.split('\n')[0] ?? '',
    invoices: client.invoiceCount,
    edit: new Cell(
      '',
      <Button tone="quiet" onClick={() => setEditing({ mode: 'edit', client })}>
        Edit <span className="ui-visually-hidden">{client.name}</span>
      </Button>,
    ),
  }));

  return (
    <>
      <div className="page-head">
        <h1>Clients</h1>
        <Button tone="primary" onClick={() => setEditing({ mode: 'new' })}>
          Add client
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No clients yet. Add the first one to start invoicing them.</p>
        </div>
      ) : (
        <DataTable
          caption="Your studio's clients"
          rows={rows}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'address', label: 'Address' },
            { key: 'invoices', label: 'Invoices' },
            { key: 'edit', label: 'Actions', sortable: false },
          ]}
        />
      )}

      {editing ? (
        <ClientDialog
          client={editing.mode === 'edit' ? editing.client : null}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
