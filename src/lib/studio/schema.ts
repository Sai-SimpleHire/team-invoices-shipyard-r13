import { z } from 'zod';

import { field } from '@/seams/validate';

/** The first screen after sign-up: the studio's name and the owner's own name. */
export const newStudioSchema = z.object({
  studioName: field
    .requiredText('the name of your studio')
    .pipe(z.string().max(120, 'Keep the studio name under 120 characters.')),
  yourName: field
    .requiredText('your name')
    .pipe(z.string().max(120, 'Keep your name under 120 characters.')),
});

export type NewStudioInput = z.infer<typeof newStudioSchema>;
