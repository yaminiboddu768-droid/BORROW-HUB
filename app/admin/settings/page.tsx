'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  RefreshCw,
  Server,
} from 'lucide-react';
import { INITIAL_ADMIN_SETTINGS, AdminSystemSettings } from '@/lib/adminMockData';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSystemSettings>(INITIAL_ADMIN_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggle = (key: keyof AdminSystemSettings) => {
    setSettings((prev: any) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`Updated system setting: "${String(key)}" set to ${updated[key]}`);
      return updated;
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform configuration and security parameters successfully saved.');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink border border-marigold/50 text-paper p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-moss shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-marigold font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Platform Governance</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            System Settings & Security Policies
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Configure global commission structures, auto-KYC rules, maintenance toggles, and system security.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-paper/10 p-3 rounded-2xl border border-paper/15 font-data text-xs">
          <Server className="w-4 h-4 text-moss" />
          <span className="text-paper/60">Version:</span>
          <span className="text-marigold font-bold">{settings.systemVersion}</span>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Financial & Fee Policy */}
        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-paper flex items-center gap-2">
            <Sliders className="w-5 h-5 text-marigold" />
            Financial & Commission Rates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-data uppercase text-paper/80 font-bold mb-1.5">
                Default Platform Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.platformCommissionRate}
                onChange={(e) =>
                  setSettings({ ...settings, platformCommissionRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 text-xs bg-paper/10 border border-paper/20 rounded-xl text-paper font-data focus:outline-none focus:border-marigold"
              />
              <p className="text-[11px] text-paper/50 font-data mt-1">
                Platform fee percentage applied to all commercial partner rentals.
              </p>
            </div>

            <div>
              <label className="block text-xs font-data uppercase text-paper/80 font-bold mb-1.5">
                Max Allowed Borrow Days Limit
              </label>
              <input
                type="number"
                value={settings.maxBorrowDaysLimit}
                onChange={(e) =>
                  setSettings({ ...settings, maxBorrowDaysLimit: parseInt(e.target.value) || 30 })
                }
                className="w-full px-4 py-2.5 text-xs bg-paper/10 border border-paper/20 rounded-xl text-paper font-data focus:outline-none focus:border-marigold"
              />
              <p className="text-[11px] text-paper/50 font-data mt-1">
                Maximum duration for single borrow request without admin renewal.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Automation & Governance Toggles */}
        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-paper flex items-center gap-2">
            <Shield className="w-5 h-5 text-moss" />
            Automation & Security Toggles
          </h2>

          <div className="divide-y divide-paper/10">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-paper block">Require Govt ID Verification for High-Value Rentals</span>
                <span className="text-xs text-paper/60">Enforce Aadhaar / Passport verification before allowing borrowing.</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('requireIdForRentals')}
                className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                  settings.requireIdForRentals ? 'bg-moss justify-end' : 'bg-paper/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-paper shadow" />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-paper block">Auto-Approve Community Neighbour Listings</span>
                <span className="text-xs text-paper/60">Bypass moderation queue for free neighbourhood items.</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoApproveNeighbourListings')}
                className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                  settings.autoApproveNeighbourListings ? 'bg-moss justify-end' : 'bg-paper/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-paper shadow" />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-paper block text-red-400">System Maintenance Mode</span>
                <span className="text-xs text-paper/60">Restrict public access and put website in maintenance state.</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                  settings.maintenanceMode ? 'bg-red-500 justify-end' : 'bg-paper/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-paper shadow" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-marigold text-ink font-display font-bold text-sm hover:bg-marigold-hover shadow-lg transition-all"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
