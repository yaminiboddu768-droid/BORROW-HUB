'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, AlertCircle, Sparkles, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuthContext';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickFillDemo = () => {
    setEmail('admin@borrowhub.com');
    setPassword('admin123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-marigold selection:text-ink">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-marigold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-moss/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Borrow Hub Official Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 p-2 rounded-2xl bg-paper/10 border border-paper/15 shadow-xl">
            <img
              src="/logo.png"
              alt="Borrow Hub Logo"
              className="w-16 h-16 object-contain rounded-xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-paper tracking-tight">
            Borrow Hub
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-marigold/20 text-marigold border border-marigold/30 text-xs font-data font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </div>
          <p className="text-xs text-paper/70 font-data mt-2">
            Isolated Security & Platform Operations Desk
          </p>
        </div>

        {/* Login Card matching Borrow Hub styling */}
        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick Demo Credentials Callout */}
          <div className="p-4 rounded-2xl bg-marigold/15 border border-marigold/40 flex items-start justify-between gap-3 shadow-inner">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-marigold font-display">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Demo Admin Credentials</span>
              </div>
              <p className="text-xs text-paper/80 mt-1 leading-snug">
                Click below to automatically populate demo credentials.
              </p>
              <div className="mt-2 text-[11px] font-data text-paper/60">
                Email: <span className="text-paper font-semibold">admin@borrowhub.com</span> | Pass: <span className="text-paper font-semibold">admin123</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="shrink-0 px-3.5 py-1.5 text-xs font-display font-bold rounded-xl bg-marigold text-ink hover:bg-marigold-hover transition-all shadow active:scale-95"
            >
              Quick Fill
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-paper/80 font-data mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@borrowhub.com"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-paper/10 border border-paper/20 rounded-xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-paper/80 font-data mb-1.5">
                Security Passcode
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-paper/10 border border-paper/20 rounded-xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-marigold text-ink font-display font-bold text-base hover:bg-marigold-hover transition-all shadow-lg hover:shadow-marigold/20 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Banner */}
          <div className="pt-4 border-t border-paper/10 text-center">
            <p className="text-[11px] text-paper/50 font-data flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-moss shrink-0" />
              <span>Encrypted Session • Rate Limited • 256-bit Auth</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-data text-paper/40 mt-6">
          Borrow Hub Admin Portal © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
