import { z } from 'zod';

import { field } from '@/seams/validate';

/** A client, as the add and edit dialog sends it. Checked in the browser and on the server. */
export const clientSchema = z.object({
  name: field
    .requiredText("the client's name")
    .pipe(z.string().max(200, 'Keep the name under 200 characters.')),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Please enter the client's email address.")
    .pipe(z.email('That does not look like an email address.')),
  address: z.string().trim().max(1000, 'Keep the address under 1,000 characters.'),
});

export type ClientInput = z.infer<typeof clientSchema>;
