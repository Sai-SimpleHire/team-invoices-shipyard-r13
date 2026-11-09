import { redirect } from 'next/navigation';

import { currentUser } from '@/components/auth/current-user';
import { hasStudio } from '@/lib/studio/queries';

import { StudioNameForm } from './_components/StudioNameForm';

import '@/components/auth_screens/auth-screens.css';
import '@/lib/ui/frame.css';

/**
 * After the first sign-in: the owner names their studio, which creates it with them as owner.
 * The installed sign-up screen asks only for an email and a password, so this is where the
 * studio comes from.
 */
export default async function WelcomePage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  if (await hasStudio(user.id)) redirect('/invoices');

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <h1>Name your studio</h1>
        <p className="page-lede">
          Your clients and invoices will belong to the studio, and so will the colleagues you add.
        </p>
        <StudioNameForm />
      </div>
    </main>
  );
}
