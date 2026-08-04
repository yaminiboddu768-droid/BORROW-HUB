import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';

export default async function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  const partnerStatus = (session.user as any).partnerStatus;

  if (userRole !== 'partner' || partnerStatus !== 'approved') {
    if (userRole === 'partner' && partnerStatus === 'pending') {
      redirect('/partner/pending');
    }
    if (userRole === 'partner' && partnerStatus === 'rejected') {
      redirect('/partner/rejected');
    }
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-sand">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
