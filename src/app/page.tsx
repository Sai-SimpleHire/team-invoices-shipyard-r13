import { redirect } from 'next/navigation';

import { currentUser } from '@/components/auth/current-user';

/** The home address always answers: to sign in, or to the studio's invoices. */
export default async function Home() {
  const user = await currentUser();
  redirect(user ? '/invoices' : '/sign-in');
}
