'use client';

import { Button } from '@/components/ui_foundation/Button';

/** A studio page that could not load: a plain sentence and a way to try again, never a trace. */
export default function StudioPageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="empty-state" role="alert">
      <h1>This page did not load</h1>
      <p>Something went wrong on our side. Nothing you saved has been lost.</p>
      <Button tone="primary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
