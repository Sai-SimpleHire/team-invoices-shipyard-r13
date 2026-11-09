import type { ReactNode } from 'react';

import { studioForPage } from '@/lib/studio/context';
import { StudioFrame } from '@/lib/ui/StudioFrame';

/** Every studio page: signed in, in a studio, inside the frame. Anyone else is sent on. */
export default async function StudioLayout({ children }: { children: ReactNode }) {
  const studio = await studioForPage();
  return (
    <StudioFrame studioName={studio.studioName} personName={studio.personName}>
      {children}
    </StudioFrame>
  );
}
