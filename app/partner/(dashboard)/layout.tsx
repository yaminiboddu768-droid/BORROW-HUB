import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { LayoutDashboard, Package, ClipboardList, BarChart3, UserCircle, LogOut } from 'lucide-react';

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
    // Fallback for non-partners or other statuses
    redirect('/');
  }

  const navigation = [
    { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/partner/inventory', icon: Package },
    { name: 'Requests', href: '/partner/requests', icon: ClipboardList },
    { name: 'Analytics', href: '/partner/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/partner/profile', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/partner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-marigold text-ink font-bold flex items-center justify-center">
              ∞
            </div>
            <span className="font-display font-bold text-xl text-ink">Partner Hub</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate hover:bg-slate-50 hover:text-ink transition-colors font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <span className="font-display font-bold text-lg text-ink">Partner Hub</span>
          <Link href="/api/auth/signout" className="text-slate hover:text-ink">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
