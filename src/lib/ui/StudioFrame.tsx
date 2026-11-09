'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { AppShell } from '@/components/ui_blocks/AppShell';

import { SignOutButton } from './SignOutButton';

import './frame.css';

const SECTIONS = [
  { href: '/invoices', label: 'Invoices' },
  { href: '/clients', label: 'Clients' },
  { href: '/team', label: 'Team' },
] as const;

/** The frame round every studio page: the sections, whose studio this is, and signing out. */
export function StudioFrame({
  studioName,
  personName,
  children,
}: {
  studioName: string;
  personName: string;
  children: ReactNode;
}) {
  const path = usePathname();
  return (
    <AppShell items={SECTIONS} path={path}>
      <div className="studio-bar">
        <span className="studio-name">{studioName}</span>
        <span className="studio-person">Signed in as {personName}</span>
        <SignOutButton />
      </div>
      <div className="studio-page">{children}</div>
    </AppShell>
  );
}
