'use client';

import React, { useState } from 'react';
import {
  Store,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit,
  IndianRupee,
  ShieldCheck,
  Star,
  Percent,
  Sliders,
} from 'lucide-react';
import { INITIAL_ADMIN_BUSINESS_PARTNERS, AdminBusinessPartner } from '@/lib/adminMockData';

export default function AdminBusinessPartnersPage() {
  const [partners, setPartners] = useState<AdminBusinessPartner[]>(INITIAL_ADMIN_BUSINESS_PARTNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPartner, setEditingPartner] = useState<AdminBusinessPartner | null>(null);
  const [newCommission, setNewCommission] = useState<number>(8.5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateCommission = () => {
    if (!editingPartner) return;
    setPartners((prev) =>
      prev.map((p) => (p.id === editingPartner.id ? { ...p, commissionRate: newCommission } : p))
    );
    showToast(`Updated commission rate for ${editingPartner.storeName} to ${newCommission}%.`);
    setEditingPartner(null);
  };

  const toggleFreezeStore = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStatus = p.verificationStatus === 'Frozen' ? 'Verified' : 'Frozen';
        showToast(`Store "${p.storeName}" account status changed to ${newStatus}.`);
        return { ...p, verificationStatus: newStatus };
      })
    );
  };

  const filteredPartners = partners.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.storeName.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

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
            <Store className="w-4 h-4" />
            <span>Commercial Store Network</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Business Partner Management
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Manage partner stores, custom commission tiers, inventory quotas, and payout status.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-paper/10 p-3 rounded-2xl border border-paper/15 font-data text-xs">
          <div>
            <span className="text-paper/50 block text-[10px]">AVG COMMISSION</span>
            <span className="text-marigold font-bold text-base">8.6%</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search store name, category, or owner email..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-paper/10 border border-paper/15 rounded-2xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold"
        />
      </div>

      {/* Grid of Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 space-y-4 shadow-xl hover:border-marigold/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-paper">{partner.storeName}</h3>
                  {partner.verificationStatus === 'Verified' && (
                    <span title="Verified Partner">
                      <ShieldCheck className="w-4 h-4 text-moss shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-paper/60">Owner: {partner.ownerName} • {partner.email}</p>
                <span className="inline-block mt-1 text-[10px] font-data px-2 py-0.5 rounded bg-marigold/20 text-marigold border border-marigold/30">
                  {partner.category}
                </span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-data ${
                  partner.verificationStatus === 'Verified'
                    ? 'bg-moss/20 text-moss border border-moss/30'
                    : partner.verificationStatus === 'Frozen'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-marigold/20 text-marigold border border-marigold/30'
                }`}
              >
                {partner.verificationStatus}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-paper/5 border border-paper/10 font-data text-xs text-center">
              <div>
                <span className="text-paper/50 block text-[10px]">LISTINGS</span>
                <span className="text-paper font-bold text-sm">{partner.totalListings}</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px]">TOTAL GMV</span>
                <span className="text-marigold font-bold text-sm">₹{(partner.gmvGenerated / 1000).toFixed(0)}k</span>
              </div>
              <div>
                <span className="text-paper/50 block text-[10px]">COMMISSION</span>
                <span className="text-moss font-bold text-sm">{partner.commissionRate}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setEditingPartner(partner);
                  setNewCommission(partner.commissionRate);
                }}
                className="px-3.5 py-2 rounded-xl bg-paper/15 hover:bg-marigold hover:text-ink text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Adjust Commission</span>
              </button>

              <button
                onClick={() => toggleFreezeStore(partner.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  partner.verificationStatus === 'Frozen'
                    ? 'bg-moss text-paper hover:bg-moss-hover'
                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                }`}
              >
                {partner.verificationStatus === 'Frozen' ? 'Unfreeze Store' : 'Freeze Store'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Commission Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182326] border border-paper/20 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-paper">Adjust Commission Rate</h3>
                <p className="text-xs text-paper/60">{editingPartner.storeName}</p>
              </div>
              <button onClick={() => setEditingPartner(null)} className="text-paper/50 hover:text-paper">✕</button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-data uppercase text-paper/80 font-bold">
                Platform Commission Fee (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  value={newCommission}
                  onChange={(e) => setNewCommission(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-sm bg-paper/10 border border-paper/20 rounded-xl text-paper font-data focus:outline-none focus:border-marigold"
                />
                <span className="text-sm font-bold text-marigold font-data">%</span>
              </div>
              <p className="text-[11px] text-paper/50 font-data">
                Standard platform fee is 8.5%. Lower rates can be granted to high-volume commercial partners.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingPartner(null)}
                className="px-4 py-2 rounded-xl bg-paper/15 text-xs font-bold text-paper"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCommission}
                className="px-5 py-2 rounded-xl bg-marigold text-ink font-display font-bold text-xs hover:bg-marigold-hover shadow"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
