'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Store,
  Package,
  ArrowRightLeft,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { adminUser, logout } = useAdminAuth();

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/business-verification',
      label: 'KYC Verification',
      icon: ShieldCheck,
      badge: '3 Urgent',
      badgeColor: 'bg-marigold text-ink font-bold',
    },
    {
      href: '/admin/users',
      label: 'User Accounts',
      icon: Users,
    },
    {
      href: '/admin/business-partners',
      label: 'Business Partners',
      icon: Store,
    },
    {
      href: '/admin/listings',
      label: 'Platform Listings',
      icon: Package,
    },
    {
      href: '/admin/requests',
      label: 'Orders & Requests',
      icon: ArrowRightLeft,
    },
    {
      href: '/admin/reports',
      label: 'Disputes & Reports',
      icon: AlertTriangle,
      badge: '2 New',
      badgeColor: 'bg-red-500 text-white font-bold',
    },
    {
      href: '/admin/analytics',
      label: 'Platform Analytics',
      icon: BarChart3,
    },
    {
      href: '/admin/settings',
      label: 'System Settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href));

  const content = (
    <div className="flex flex-col h-full bg-ink text-paper border-r-4 border-marigold shadow-2xl">
      {/* Brand Header with Official Borrow Hub Logo */}
      <div className="p-5 border-b border-paper/10 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group focus:outline-none">
          <img
            src="/logo.png"
            alt="Borrow Hub Logo"
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl"
          />
          <div>
            <div className="font-display font-bold text-xl tracking-tight text-paper group-hover:text-marigold transition-colors flex items-center gap-2">
              Borrow Hub
              <span className="text-[10px] font-data font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-marigold text-ink shadow-sm">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-paper/60 font-data mt-0.5">Control Center</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3.5 py-1.5 text-[11px] font-data font-bold uppercase tracking-wider text-paper/40">
          Management Console
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen?.(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-paper/15 text-marigold font-semibold border-l-2 border-marigold'
                  : 'text-paper/80 hover:text-paper hover:bg-paper/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-marigold' : 'text-paper/60'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-data shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {!active && <ChevronRight className="w-3.5 h-3.5 text-paper/30 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-paper/10 bg-paper/5">
        <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-paper/10 border border-paper/10">
          <img
            src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200'}
            alt="Admin Avatar"
            className="w-9 h-9 rounded-lg object-cover border border-marigold"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-paper truncate">{adminUser?.name || 'Super Admin'}</p>
            <p className="text-[11px] text-marigold truncate font-data">{adminUser?.role || 'Head of Operations'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-display font-semibold rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all border border-red-500/30 active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
