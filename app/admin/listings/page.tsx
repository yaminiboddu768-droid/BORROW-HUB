'use client';

import React, { useState } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  Star,
  Sparkles,
  Trash2,
  Eye,
  ShieldAlert,
  Tag,
} from 'lucide-react';
import { INITIAL_ADMIN_LISTINGS, AdminListing } from '@/lib/adminMockData';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>(INITIAL_ADMIN_LISTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleFeatured = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newFeatured = !item.isFeatured;
        showToast(`Listing "${item.title}" ${newFeatured ? 'featured on homepage' : 'removed from featured'}.`);
        return { ...item, isFeatured: newFeatured };
      })
    );
  };

  const toggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus = item.status === 'Active' ? 'Flagged' : 'Active';
        showToast(`Listing "${item.title}" status set to ${newStatus}.`);
        return { ...item, status: newStatus };
      })
    );
  };

  const removeListing = (id: string) => {
    const target = listings.find((l) => l.id === id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      showToast(`Removed listing "${target.title}" from Borrow Hub catalog.`);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (typeFilter !== 'All' && item.type !== typeFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.ownerOrStore.toLowerCase().includes(q);
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
            <Package className="w-4 h-4" />
            <span>Platform Listings Catalog</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Listings Moderation Desk
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Review neighbourhood borrow items and partner rental inventory across all categories.
          </p>
        </div>

        <div className="flex items-center gap-2 font-data text-xs bg-paper/10 p-3 rounded-2xl border border-paper/15">
          <span className="text-paper/60">Catalog Total:</span>
          <span className="text-marigold font-bold text-base">{listings.length} Items</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, owner, category, or item ID..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-paper/10 border border-paper/15 rounded-2xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs bg-ink border border-paper/15 rounded-2xl text-paper font-data focus:outline-none focus:border-marigold"
        >
          <option value="All">All Types</option>
          <option value="Neighbourhood">Neighbourhood Borrows</option>
          <option value="Partner Rental">Partner Rentals</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs bg-ink border border-paper/15 rounded-2xl text-paper font-data focus:outline-none focus:border-marigold"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Flagged">Flagged</option>
        </select>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-marigold/40 transition-all"
          >
            <div className="relative h-44 bg-paper/5">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold font-data px-2 py-0.5 rounded bg-ink/80 text-marigold backdrop-blur-md border border-paper/10">
                  {item.type}
                </span>
                {item.isFeatured && (
                  <span className="text-[10px] uppercase font-bold font-data px-2 py-0.5 rounded bg-marigold text-ink shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <span
                  className={`text-[10px] font-bold font-data px-2 py-0.5 rounded-full ${
                    item.status === 'Active'
                      ? 'bg-moss text-paper'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-paper line-clamp-1">{item.title}</h3>
                <p className="text-xs text-paper/60 mt-0.5">Owner: {item.ownerOrStore}</p>

                {item.flagReason && (
                  <div className="mt-2 p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{item.flagReason}</span>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-data bg-paper/5 p-2.5 rounded-xl border border-paper/10">
                  <div>
                    <span className="text-paper/50 text-[10px] block">RENTAL RATE</span>
                    <span className="text-marigold font-bold">₹{item.pricePerDay}/day</span>
                  </div>
                  <div>
                    <span className="text-paper/50 text-[10px] block">SECURITY DEPOSIT</span>
                    <span className="text-paper font-bold">₹{item.depositAmount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-paper/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    item.isFeatured
                      ? 'bg-marigold/20 text-marigold border border-marigold/30'
                      : 'bg-paper/10 text-paper/70 hover:text-paper'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{item.isFeatured ? 'Unfeature' : 'Feature'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-paper/15 hover:bg-marigold hover:text-ink text-xs font-bold transition-colors"
                  >
                    {item.status === 'Active' ? 'Flag' : 'Activate'}
                  </button>
                  <button
                    onClick={() => removeListing(item.id)}
                    className="p-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    title="Remove Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
