'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  ShieldAlert,
  LogOut,
  User,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuthContext';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const { adminUser, logout } = useAdminAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sampleNotifications = [
    {
      id: 'n1',
      title: 'New Partner KYC Request',
      message: 'Apex Camera & Rig Rentals submitted verification documents.',
      time: '10 mins ago',
    },
    {
      id: 'n2',
      title: 'Dispute Flagged',
      message: 'Priya Sundaram reported damaged Bosch Drill returned by user Karan.',
      time: '1 hour ago',
    },
    {
      id: 'n3',
      title: 'System Backup Complete',
      message: 'Daily encrypted database snapshot stored to secure vault.',
      time: '4 hours ago',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-ink text-paper border-b-4 border-marigold shadow-md px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left side: Mobile Toggle & Brand / Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-paper hover:bg-paper/10 hover:text-marigold transition-colors focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Logo */}
        <Link href="/admin/dashboard" className="lg:hidden flex items-center gap-2">
          <img src="/logo.png" alt="Borrow Hub Logo" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-display font-bold text-lg text-paper tracking-tight">Borrow Hub</span>
        </Link>

        {/* Global Admin Search Bar */}
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, partners, GSTIN, listing IDs..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-paper/10 border border-paper/15 rounded-xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition-all"
          />
        </div>
      </div>

      {/* Right side: Status Indicator, Notifications, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-moss/20 border border-moss/40 text-moss text-xs font-medium font-data shadow-sm">
          <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
          <span>System Healthy</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2.5 rounded-xl bg-paper/10 hover:bg-paper/20 text-paper transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-marigold" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-ink border border-paper/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3.5 border-b border-paper/10 flex items-center justify-between bg-paper/5">
                <span className="font-display font-bold text-sm text-paper">Admin Notifications</span>
                <span className="text-[10px] font-data font-bold px-2 py-0.5 rounded bg-marigold text-ink">3 New</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-paper/10">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-paper/5 transition-colors cursor-pointer">
                    <p className="text-xs font-bold text-marigold flex items-center gap-1.5 font-display">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-marigold" />
                      {n.title}
                    </p>
                    <p className="text-xs text-paper/80 mt-1 leading-snug">{n.message}</p>
                    <p className="text-[10px] font-data text-paper/40 mt-1.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-paper/10 hover:bg-paper/20 transition-colors border border-paper/10 focus:outline-none"
          >
            <img
              src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200'}
              alt="Admin Profile"
              className="w-7 h-7 rounded-lg object-cover border border-marigold"
            />
            <span className="hidden md:inline text-xs font-semibold text-paper max-w-[120px] truncate">
              {adminUser?.name || 'Super Admin'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-ink border border-paper/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-paper/10 bg-paper/5">
                <p className="text-xs font-bold text-paper font-display">{adminUser?.name || 'Super Admin'}</p>
                <p className="text-[11px] text-marigold font-data truncate">{adminUser?.email}</p>
                <span className="inline-block mt-1.5 text-[10px] uppercase font-bold font-data px-2 py-0.5 rounded bg-marigold/20 text-marigold border border-marigold/30">
                  {adminUser?.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
