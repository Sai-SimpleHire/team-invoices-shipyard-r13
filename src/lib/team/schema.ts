import { z } from 'zod';

import { field } from '@/seams/validate';

/**
 * A colleague the studio is adding. The password's strength rules are the sign-in part's own and
 * are checked on the server; here it only has to be long enough to be worth sending.
 */
export const colleagueSchema = z.object({
  name: field
    .requiredText('their name')
    .pipe(z.string().max(120, 'Keep the name under 120 characters.')),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Please enter their email address.')
    .pipe(z.email('That does not look like an email address.')),
  password: z
    .string()
    .min(12, 'The starting password needs at least 12 characters.')
    .max(72, 'The starting password can be at most 72 characters.'),
});

export type ColleagueInput = z.infer<typeof colleagueSchema>;
