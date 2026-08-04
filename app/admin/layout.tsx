import React from 'react';
import { Metadata } from 'next';
import { AdminAuthProvider } from '@/lib/AdminAuthContext';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export const metadata: Metadata = {
  title: 'Admin Portal — Borrow Hub',
  description: 'Isolated administrative control portal for Borrow Hub platform management.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminAuthProvider>
  );
}
