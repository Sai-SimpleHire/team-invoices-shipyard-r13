'use client';

import { useState } from 'react';

import { DataTable } from '@/components/data_table/DataTable';
import { Button } from '@/components/ui_foundation/Button';
import { Cell } from '@/lib/ui/cell';

import { ColleagueDialog } from './ColleagueDialog';

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  /** ISO time; shown as a date in the reader's own time zone. */
  joinedAt: string;
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Everyone in the studio. Every member can do everything, so there are no roles to show. */
export function TeamView({ members }: { members: TeamMember[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const rows = members.map((member) => ({
    name: member.name,
    email: member.email,
    joined: new Cell(
      member.joinedAt,
      <span suppressHydrationWarning>{DATE.format(new Date(member.joinedAt))}</span>,
    ),
  }));

  return (
    <>
      <div className="page-head">
        <h1>Team</h1>
        <Button tone="primary" onClick={() => setIsAdding(true)}>
          Add a colleague
        </Button>
      </div>
      <p className="page-lede">
        Everyone here can add clients and create, send and mark invoices paid.
      </p>
      {added ? (
        <p role="status">
          {added} can now sign in with their email address and the starting password you chose.
        </p>
      ) : null}
      <DataTable
        caption="People in your studio"
        rows={rows}
        searchable={members.length > 10}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'joined', label: 'Joined' },
        ]}
      />
      {isAdding ? (
        <ColleagueDialog
          onClose={() => setIsAdding(false)}
          onAdded={(name) => {
            setAdded(name);
            setIsAdding(false);
          }}
        />
      ) : null}
    </>
  );
}
