'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Package, ClipboardList, TrendingUp, User, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface PartnerNavbarProps {
  partnerName: string;
}

export function PartnerNavbar({ partnerName }: PartnerNavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutGrid },
    { name: 'Inventory', href: '/partner/inventory', icon: Package },
    { name: 'Requests', href: '/partner/requests', icon: ClipboardList },
    { name: 'Analytics', href: '/partner/analytics', icon: TrendingUp },
    { name: 'Profile', href: '/partner/profile', icon: User },
  ];

  return (
    <header className="bg-[#121721] text-white sticky top-0 z-50 border-b-2 border-amber-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/partner/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#121721] font-extrabold text-xl flex items-center justify-center">
                b
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 h-16">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/partner/dashboard' && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 h-full border-b-2 font-medium text-sm transition-all ${
                      isActive
                        ? 'border-amber-400 text-amber-400 font-semibold'
                        : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Partner Account Badge & Settings */}
          <div className="flex items-center gap-4">
            <div className="bg-[#1C2433] hover:bg-[#252F42] text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-slate-700/50 cursor-pointer transition-colors max-w-[200px] truncate">
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{partnerName}</span>
            </div>

            <Link
              href="/partner/profile"
              className="text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium px-2 py-1 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-red-400 hover:text-red-300 p-1 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/partner/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs py-1 px-2 ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
