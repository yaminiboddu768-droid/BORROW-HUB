import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import ActivityClient from './ActivityClient';

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/activity');
  }

  return <ActivityClient />;
}
