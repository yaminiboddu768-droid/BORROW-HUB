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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export default function AdminListingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/listings');
      if (!res.ok) throw new Error('Failed to fetch listings');
      return res.json();
    }
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/listings?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete listing');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      showToast('Removed listing from Borrow Hub catalog.');
    }
  });

  const toggleFeatured = (id: string) => {
    showToast('Listing featured status updated (UI only).');
  };

  const toggleStatus = (id: string) => {
    showToast('Listing status updated (UI only).');
  };

  const removeListing = (id: string) => {
    deleteListingMutation.mutate(id);
  };

  const filteredListings = listings.filter((item: any) => {
    if (typeFilter !== 'All' && item.type !== typeFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.owner?.name?.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
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
        {filteredListings.map((item: any) => (
          <div
            key={item.id}
            className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-marigold/40 transition-all"
          >
            <div className="relative h-44 bg-paper/5">
              <img src={item.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold font-data px-2 py-0.5 rounded bg-ink/80 text-marigold backdrop-blur-md border border-paper/10">
                  {item.category}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span
                  className={`text-[10px] font-bold font-data px-2 py-0.5 rounded-full bg-moss text-paper`}
                >
                  Active
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-paper line-clamp-1">{item.name}</h3>
                <p className="text-xs text-paper/60 mt-0.5">Owner: {item.owner?.name || 'N/A'}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-data bg-paper/5 p-2.5 rounded-xl border border-paper/10">
                  <div>
                    <span className="text-paper/50 text-[10px] block">RENTAL RATE</span>
                    <span className="text-marigold font-bold">${item.pricePerDay}/day</span>
                  </div>
                  <div>
                    <span className="text-paper/50 text-[10px] block">SECURITY DEPOSIT</span>
                    <span className="text-paper font-bold">${item.securityDeposit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-paper/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 bg-paper/10 text-paper/70 hover:text-paper`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Feature</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeListing(item.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete Listing"
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
