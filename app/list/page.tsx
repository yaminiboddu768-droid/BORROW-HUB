import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import ListItemClient from './ListItemClient';

export default async function ListItemPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/list');
  }

  return <ListItemClient userName={session.user?.name || 'You'} />;
}
