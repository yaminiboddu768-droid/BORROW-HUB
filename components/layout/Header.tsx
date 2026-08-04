'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Settings, User, LogOut } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const userRole = (session?.user as any)?.role;
  const isPartner = userRole === 'partner';

  const openSettings = () => {
    setMobileMenuOpen(false);
    setSettingsOpen(true);
    const params = new URLSearchParams(window.location.search);
    params.set('settings', 'main');
    router.push(`${pathname}?${params.toString()}`);
  };

  interface NavLinkItem {
    href: string;
    label: string;
    badge?: string;
  }

  const userNavLinks: NavLinkItem[] = [
    { href: '/browse', label: 'Browse Neighbourhood' },
    { href: '/online', label: 'Online Store', badge: 'Partner' },
    { href: '/list', label: 'List an Item' },
    { href: '/activity', label: 'My Activity' },
  ];

  const partnerNavLinks: NavLinkItem[] = [
    { href: '/partner/dashboard', label: 'Dashboard' },
    { href: '/partner/inventory', label: 'Inventory' },
    { href: '/partner/requests', label: 'Requests' },
    { href: '/partner/analytics', label: 'Analytics' },
    { href: '/partner/profile', label: 'Profile' },
  ];

  const navLinks: NavLinkItem[] = isPartner ? partnerNavLinks : userNavLinks;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && (pathname === path || pathname.startsWith(path))) return true;
    return false;
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-ink text-paper border-b-4 border-marigold shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Wordmark - Always Borrow Hub */}
          <Link href={isPartner ? '/partner/dashboard' : '/'} className="flex items-center gap-2 group focus:outline-none">
            <img 
              src="/logo.png" 
              alt="Borrow Hub Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl"
            />
            <span className="font-display font-bold text-2xl tracking-tight text-paper group-hover:text-marigold transition-colors">
              Borrow Hub
            </span>
          </Link>

          {/* Desktop Navigation - Role-Based Replacement in the SAME bar */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'bg-paper/15 text-marigold font-semibold'
                      : 'text-paper/80 hover:text-paper hover:bg-paper/10'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] uppercase font-data font-bold px-1.5 py-0.5 rounded bg-clay text-paper">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Auth & Settings */}
          <div className="hidden md:flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="w-24 h-8 rounded-xl bg-paper/10 animate-pulse" />
            ) : session ? (
              /* Logged-in state */
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper/10 text-sm hover:bg-paper/20 transition-colors focus:outline-none"
                  >
                    <User className="w-3.5 h-3.5 text-marigold shrink-0" />
                    <span className="text-paper/90 font-medium truncate max-w-[140px]">
                      {session.user?.name || session.user?.email}
                    </span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-ink rounded-xl shadow-lg border border-paper/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <Link 
                        href={isPartner ? '/partner/profile' : '/profile/edit'} 
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-paper hover:bg-paper/10 transition-colors"
                      >
                        {isPartner ? 'Business Profile' : 'Edit Profile'}
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          signOut({ callbackUrl: '/login' });
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-paper/10 transition-colors flex items-center gap-2 border-t border-paper/10 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={openSettings}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-paper/80 hover:text-paper hover:bg-paper/10 transition-all"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            ) : (
              /* Logged-out state */
              <>
                <Link
                  href="/login"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/login') ? 'text-marigold' : 'text-paper/80 hover:text-paper'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-display font-semibold bg-marigold text-ink hover:bg-marigold-hover transition-all shadow hover:shadow-md active:scale-95"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-paper hover:text-marigold hover:bg-paper/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink/95 border-t border-paper/10 px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between ${
                  active ? 'bg-paper/15 text-marigold font-bold' : 'text-paper/90 hover:bg-paper/10'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] uppercase font-data font-bold px-2 py-0.5 rounded bg-clay text-paper">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Mobile Auth Section */}
          <div className="pt-4 border-t border-paper/10 flex flex-col gap-2">
            {status === 'loading' ? (
              <div className="h-10 rounded-xl bg-paper/10 animate-pulse" />
            ) : session ? (
              <>
                <div className="px-4 py-2 text-sm text-paper/70 font-data">
                  Logged in as <span className="text-marigold font-semibold">{session.user?.name || session.user?.email}</span>
                </div>
                <Link
                  href={isPartner ? '/partner/profile' : '/profile/edit'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-paper/20 text-paper font-medium hover:bg-paper/10"
                >
                  {isPartner ? 'Business Profile' : 'Edit Profile'}
                </Link>
                <button
                  onClick={openSettings}
                  className="w-full text-center py-2.5 rounded-xl border border-paper/20 text-paper font-medium hover:bg-paper/10 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-paper/20 text-paper font-medium hover:bg-paper/10"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-marigold text-ink font-display font-semibold hover:bg-marigold-hover"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      <Suspense fallback={null}>
        <SettingsSidebar isOpen={settingsOpen} onClose={() => {
          setSettingsOpen(false);
          const params = new URLSearchParams(window.location.search);
          if (params.has('settings')) {
            params.delete('settings');
            const newSearch = params.toString();
            const target = newSearch ? `${pathname}?${newSearch}` : pathname;
            router.push(target);
          }
        }} />
      </Suspense>
    </header>
  );
}
