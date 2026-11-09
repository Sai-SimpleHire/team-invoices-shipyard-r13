'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui_foundation/Button';

export function SignOutButton() {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function signOut(): Promise<void> {
    setIsBusy(true);
    setProblem(null);
    const response = await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    if (!response?.ok) {
      setIsBusy(false);
      setProblem('Signing out did not work. Try again.');
      return;
    }
    router.refresh();
    router.push('/sign-in');
  }

  return (
    <>
      <Button tone="quiet" busy={isBusy} onClick={signOut}>
        {isBusy ? 'Signing out…' : 'Sign out'}
      </Button>
      {problem ? (
        <span className="field-error" role="alert">
          {problem}
        </span>
      ) : null}
    </>
  );
}
