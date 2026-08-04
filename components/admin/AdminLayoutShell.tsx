'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (!isLoading) {
      if (isLoginPage && isAuthenticated) {
        router.replace('/admin/dashboard');
      } else if (!isLoginPage && !isAuthenticated) {
        router.replace('/admin');
      }
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // Loading state during auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-marigold flex items-center justify-center text-ink shadow-2xl animate-bounce">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2 text-sm font-data text-paper/80">
            <Loader2 className="w-4 h-4 animate-spin text-marigold" />
            <span>Verifying Admin Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  // If on login page and not authenticated, render login page directly
  if (isLoginPage) {
    if (isAuthenticated) {
      return (
        <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center p-6">
          <div className="flex items-center gap-2 text-sm font-data text-marigold">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Redirecting to Admin Dashboard...</span>
          </div>
        </div>
      );
    }
    return <main className="min-h-screen bg-ink text-paper">{children}</main>;
  }

  // If on protected admin route and unauthenticated, show redirect spinner
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-display font-semibold text-paper">Protected Admin Route</p>
          <p className="text-xs font-data text-paper/60 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-marigold" />
            Redirecting to Admin Authentication...
          </p>
        </div>
      </div>
    );
  }

  // Authenticated Admin Portal Layout
  return (
    <div className="min-h-screen bg-[#121A1C] text-paper flex">
      {/* Admin Sidebar */}
      <AdminSidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
