'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, 
  CreditCard, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Heart, 
  LogOut, 
  Check, 
  Trash2, 
  ExternalLink,
  Settings as SettingsIcon,
  ChevronRight,
  User,
  HelpCircle,
  Info
} from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'main' | 'profile' | 'payment' | 'notifications' | 'appearance' | 'wishlist' | 'help' | 'logout';



function SettingsSidebarContent({ isOpen, onClose }: SettingsSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  
  const urlTab = searchParams.get('settings') as Tab | null;
  const effectiveIsOpen = isOpen || Boolean(urlTab);
  const activeTab: Tab = (urlTab as Tab) || 'main';

  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!session) return [];
      const res = await fetch('/api/user/notifications');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!session,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!session) return [];
      const res = await fetch('/api/user/wishlist');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!session,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!session) return [];
      const res = await fetch('/api/requests/borrowing');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!session,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (effectiveIsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => {
        setShowLogoutConfirm(false);
      }, 300);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [effectiveIsOpen]);

  const navigateToTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('settings', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    if (urlTab && urlTab !== 'main' && window.history.length > 1) {
      router.back();
    } else {
      navigateToTab('main');
    }
  };

  const handleClose = () => {
    onClose();
    if (urlTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('settings');
      const newSearch = params.toString();
      const target = newSearch ? `${pathname}?${newSearch}` : pathname;
      router.push(target);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = () => markAllReadMutation.mutate();

  const removeWishlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const removeWishlist = (id: string) => removeWishlistMutation.mutate(id);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${effectiveIsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-paper shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-ink/10 ${effectiveIsOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink/10">
          <div className="flex items-center gap-2">
            {activeTab !== 'main' && (
              <button 
                onClick={handleBack}
                className="p-1 hover:bg-ink/5 rounded-lg transition-colors mr-2"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2">
              {activeTab === 'main' && <><SettingsIcon className="w-5 h-5 text-marigold" /> Settings</>}
              {activeTab === 'profile' && 'Profile Settings'}
              {activeTab === 'payment' && 'Payment History'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'appearance' && 'Appearance'}
              {activeTab === 'wishlist' && 'Wishlist'}
              {activeTab === 'help' && 'Help & Support'}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-xl text-ink hover:bg-ink/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'main' && (
            <div className="space-y-2">
              {/* Profile Card */}
              {session ? (
                <button
                  onClick={() => navigateToTab('profile')}
                  className="w-full text-left bg-ink/5 hover:bg-ink/10 rounded-2xl p-4 mb-6 border border-ink/10 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-ink">{session.user?.name || 'User'}</p>
                    <p className="text-sm text-slate">{session.user?.email}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate group-hover:text-marigold transition-colors" />
                </button>
              ) : (
                <button
                  onClick={() => navigateToTab('profile')}
                  className="w-full text-left bg-ink/5 hover:bg-ink/10 rounded-2xl p-4 mb-6 border border-ink/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5"><User className="w-5 h-5 text-marigold" /></div>
                    <span className="font-bold text-ink">Profile Settings</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate group-hover:text-marigold transition-colors" />
                </button>
              )}

              <button onClick={() => navigateToTab('profile')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-3 text-ink font-medium">
                  <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-marigold transition-colors"><User className="w-5 h-5" /></div>
                  Profile Settings
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>
              
              <button onClick={() => navigateToTab('payment')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-3 text-ink font-medium">
                  <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-marigold transition-colors"><CreditCard className="w-5 h-5" /></div>
                  Payment History
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>
              
              <button onClick={() => navigateToTab('notifications')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-3 text-ink font-medium">
                  <div className="relative p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-marigold transition-colors">
                    <Bell className="w-5 h-5" />
                    {notifications.some((n: any) => !n.read) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
                  </div>
                  Notifications
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>
              
              <button onClick={() => navigateToTab('appearance')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-3 text-ink font-medium">
                  <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-marigold transition-colors">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  Appearance
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>
              
              <button onClick={() => navigateToTab('wishlist')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-3 text-ink font-medium">
                  <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-marigold transition-colors"><Heart className="w-5 h-5" /></div>
                  Wishlist
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>

              <button onClick={() => navigateToTab('help')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-ink/5 transition-colors group">
                <div className="flex items-center gap-3 text-ink font-medium">
                  <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-marigold transition-colors"><HelpCircle className="w-5 h-5" /></div>
                  Help & Support
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>

              <div className="pt-6 mt-6 border-t border-ink/10">
                {showLogoutConfirm ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-900/50">
                    <p className="font-medium text-red-800 dark:text-red-200 mb-4 text-center">Are you sure you want to log out?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-xl font-medium text-ink bg-ink/5 hover:bg-ink/10 transition-colors">Cancel</button>
                      <button onClick={handleLogout} className="flex-1 py-2 rounded-xl font-medium text-paper bg-red-600 hover:bg-red-700 transition-colors">Log out</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors group">
                    <div className="flex items-center gap-3 font-medium">
                      <div className="p-2 bg-paper rounded-xl shadow-sm border border-ink/5 group-hover:text-red-600 transition-colors"><LogOut className="w-5 h-5" /></div>
                      Log out
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 rounded-2xl bg-ink/5 border border-ink/10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-ink">{tx.item?.name}</h3>
                    <span className="text-xs font-bold px-2 py-1 bg-moss/20 text-moss-hover dark:text-moss rounded-md">{tx.status}</span>
                  </div>
                  <div className="text-sm text-slate space-y-1">
                    <p>Date: {new Date(tx.createdAt).toLocaleDateString()}</p>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-ink/10">
                      <span className="font-medium">Amount: ${tx.estimatedCost || 0}</span>
                      {tx.penaltyAmount > 0 && <span className="text-xs text-red-500">Penalty: ${tx.penaltyAmount}</span>}
                    </div>
                  </div>
                  <button className="mt-3 w-full py-2 text-sm font-medium border border-ink/20 rounded-xl hover:bg-ink/10 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={markAllRead} className="text-sm text-marigold-hover font-medium flex items-center gap-1 hover:underline">
                  <Check className="w-4 h-4" /> Mark all as read
                </button>
              </div>
              {notifications.map((n: any) => (
                <div key={n.id} className={`p-4 rounded-2xl border transition-colors ${n.isRead ? 'bg-transparent border-ink/10' : 'bg-marigold/10 border-marigold/30'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold uppercase text-slate">{n.type}</span>
                    <span className="text-xs text-slate">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-ink text-sm font-medium">{n.message}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <p className="text-slate text-sm mb-4">Choose how Borrow Hub looks to you.</p>
              
              <button 
                onClick={() => setTheme('light')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${theme === 'light' ? 'border-marigold bg-marigold/5' : 'border-ink/10 hover:border-ink/20'}`}
              >
                <div className="flex items-center gap-3 text-ink font-medium">
                  <Sun className="w-5 h-5 text-marigold" /> Light Mode
                </div>
                {theme === 'light' && <Check className="w-5 h-5 text-marigold" />}
              </button>

              <button 
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${theme === 'dark' ? 'border-marigold bg-marigold/5' : 'border-ink/10 hover:border-ink/20'}`}
              >
                <div className="flex items-center gap-3 text-ink font-medium">
                  <Moon className="w-5 h-5 text-marigold" /> Dark Mode
                </div>
                {theme === 'dark' && <Check className="w-5 h-5 text-marigold" />}
              </button>

              <button 
                onClick={() => setTheme('system')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${theme === 'system' ? 'border-marigold bg-marigold/5' : 'border-ink/10 hover:border-ink/20'}`}
              >
                <div className="flex items-center gap-3 text-ink font-medium">
                  <Monitor className="w-5 h-5 text-marigold" /> System Default
                </div>
                {theme === 'system' && <Check className="w-5 h-5 text-marigold" />}
              </button>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <p className="text-center text-slate py-8">Your wishlist is empty.</p>
              ) : (
                wishlist.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-ink/10 bg-paper hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-ink">{item.name}</h3>
                        <p className="text-xs text-slate">{item.category}</p>
                      </div>
                      <span className="font-data font-bold text-marigold-hover">${item.pricePerDay}/day</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 bg-marigold text-ink rounded-xl font-bold text-sm hover:bg-marigold-hover transition-colors">
                        Rent Now
                      </button>
                      <button className="p-2 border border-ink/20 rounded-xl hover:bg-ink/5 transition-colors group" title="View details">
                        <ExternalLink className="w-5 h-5 text-ink group-hover:text-marigold" />
                      </button>
                      <button onClick={() => removeWishlist(item.id)} className="p-2 border border-ink/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group" title="Remove">
                        <Trash2 className="w-5 h-5 text-slate group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="bg-ink/5 rounded-2xl p-6 border border-ink/10 text-center">
                <div className="w-20 h-20 bg-marigold/20 rounded-full mx-auto mb-3 flex items-center justify-center text-marigold font-bold text-2xl border-2 border-marigold">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-8 h-8 text-marigold" />}
                </div>
                <h3 className="font-display font-bold text-lg text-ink">{session?.user?.name || 'Guest User'}</h3>
                <p className="text-sm text-slate mt-1">{session?.user?.email || 'Sign in to sync your profile'}</p>
                <div className="mt-4 pt-4 border-t border-ink/10 flex justify-center gap-4 text-xs font-medium text-slate">
                  <span className="text-moss font-semibold">Verified Neighbour ✓</span>
                  <span>•</span>
                  <span>5.0 ★ Rating</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  href="/profile/edit" 
                  onClick={() => onClose()}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-marigold text-ink font-bold hover:bg-marigold-hover transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" /> Edit Profile Information
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <div className="p-4 rounded-2xl bg-paper border border-ink/10 space-y-3">
                  <h4 className="font-bold text-sm text-ink">Account Status</h4>
                  <div className="flex justify-between items-center py-2 border-b border-ink/5 text-sm">
                    <span className="text-slate">Membership</span>
                    <span className="text-ink font-medium">Borrow Hub Pro</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-ink/5 text-sm">
                    <span className="text-slate">Email Notifications</span>
                    <span className="text-moss font-medium">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-slate">Security Deposit Tier</span>
                    <span className="text-ink font-medium">Standard (100% Refundable)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="bg-marigold/10 border border-marigold/30 rounded-2xl p-4">
                <h3 className="font-bold text-ink text-sm mb-1">How can we help?</h3>
                <p className="text-xs text-slate">Find answers to common questions about sharing and borrowing in your neighbourhood.</p>
              </div>

              <div className="space-y-3">
                {[
                  { q: 'How does renting work?', a: 'Browse items in your neighbourhood or online store, select rental dates, and send a request. Coordinate pickup or delivery once approved!' },
                  { q: 'How are security deposits handled?', a: 'Deposits are held safely during the rental period and are automatically 100% refunded when the item is returned in good condition.' },
                  { q: 'What is Snap & List?', a: 'Our AI-powered listing tool lets you snap a photo of any item to automatically generate titles, categories, and fair market rental pricing.' },
                  { q: 'What if an item is damaged?', a: 'All transactions are covered under our community protection guidelines. Report any issues within 24 hours of return.' }
                ].map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-paper border border-ink/10 space-y-1.5">
                    <h4 className="font-bold text-sm text-ink">{faq.q}</h4>
                    <p className="text-xs text-slate leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SettingsSidebar(props: SettingsSidebarProps) {
  return (
    <Suspense fallback={null}>
      <SettingsSidebarContent {...props} />
    </Suspense>
  );
}
