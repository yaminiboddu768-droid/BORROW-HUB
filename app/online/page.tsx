'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/AppContext';
import { OnlineStoreItem, OnlineRentalOrder } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductDetailModal } from '@/components/online/ProductDetailModal';
import { RentBookingModal } from '@/components/online/RentBookingModal';
import { RentalTrackingModal } from '@/components/online/RentalTrackingModal';
import { ProductCard } from '@/components/online/ProductCard';
import {
  Truck,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Store
} from 'lucide-react';

export default function OnlineStorePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useApp();
  
  const queryClient = useQueryClient();

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!session) return [];
      const res = await fetch('/api/user/wishlist');
      return res.json();
    },
    enabled: !!session,
  });

  const isWishlisted = (id: string) => wishlist.some((item: any) => item.id === id);

  const toggleWishlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      addToast('Success', `Item ${data.action} wishlist`);
    },
  });

  const toggleWishlist = (id: string) => {
    if (!session) {
      addToast('Login required', 'Please log in to save items to your wishlist.', 'warning');
      router.push('/login?callbackUrl=/online');
      return;
    }
    toggleWishlistMutation.mutate(id);
  };
  
  // Keep rental orders as local arrays for now since they are complex transactions that need their own dedicated overhaul later.
  const placeOnlineRentalOrder = (data: any) => data;
  const advanceOnlineRentalStage = (id: string) => {};
  const onlineRentalOrders: any[] = [];

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc' | 'newest'>('popular');


  // Modal active states
  const [activeDetailItem, setActiveDetailItem] = useState<OnlineStoreItem | null>(null);
  const [activeBookingItem, setActiveBookingItem] = useState<OnlineStoreItem | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OnlineRentalOrder | null>(null);

  const categories = [
    'All',
    'Power Tools',
    'Hand Tools',
    'Gardening',
    'Cleaning Equipment',
    'Construction',
    'Electronics',
    'Event & Party',
    'Outdoor & Travel',
    'Home Appliances',
    'Fitness',
    'Baby & Kids',
    'Office',
    'Vehicles',
    'Medical',
    'Photography & Content Creation',
    'Cameras',
    'Tools',
    'Sports',
    'Cookware',
    'Books',
  ];

  const { data: allItems = [], isLoading, error } = useQuery({
    queryKey: ['items', 'ONLINE', selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      const url = new URL('/api/items', window.location.origin);
      url.searchParams.append('source', 'ONLINE');
      if (selectedCategory !== 'All') url.searchParams.append('category', selectedCategory);
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch items');
      
      const items = await res.json();
      return items.sort((a: any, b: any) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        return (b.timesBorrowed || b.timesRented || 0) - (a.timesBorrowed || a.timesRented || 0);
      });
    }
  });

  const filteredItems = allItems.filter((item: any) => {
    // Exclude owner items from Online Store view
    const isOwnItem =
      (session?.user?.id && item.ownerId === session.user.id) ||
      (session?.user?.id && item.owner?.id === session.user.id) ||
      item.ownerName === 'You' ||
      item.owner?.name === 'You';

    if (isOwnItem) return false;
    return true;
  });

  const handleOpenBooking = (item: OnlineStoreItem) => {
    if (!session) {
      addToast('Login required', 'Please log in to book commercial rentals.', 'warning');
      router.push('/login?callbackUrl=/online');
      return;
    }
    setActiveDetailItem(null);
    setActiveBookingItem(item);
  };

  const handleConfirmOrder = (orderData: OnlineRentalOrder) => {
    const createdOrder = placeOnlineRentalOrder(orderData);
    setActiveBookingItem(null);
    setActiveTrackingOrder(createdOrder);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Active Modals */}
        {activeDetailItem && (
          <ProductDetailModal
            item={activeDetailItem}
            onClose={() => setActiveDetailItem(null)}
            onProceedToBooking={() => handleOpenBooking(activeDetailItem)}
            isWishlisted={isWishlisted(activeDetailItem.id)}
            onToggleWishlist={() => toggleWishlist(activeDetailItem.id)}
          />
        )}

        {activeBookingItem && (
          <RentBookingModal
            item={activeBookingItem}
            onClose={() => setActiveBookingItem(null)}
            onConfirmOrder={handleConfirmOrder}
          />
        )}

        {activeTrackingOrder && (
          <RentalTrackingModal
            order={activeTrackingOrder}
            onClose={() => setActiveTrackingOrder(null)}
            onAdvanceStage={(orderId) => {
              advanceOnlineRentalStage(orderId);
              const updated = onlineRentalOrders.find(o => o.id === orderId);
              if (updated) setActiveTrackingOrder({ ...updated });
            }}
          />
        )}

        {/* Hero Title & Banner Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="clay" className="mb-3 bg-blue-100 text-blue-800 border-none px-3 py-1 text-xs uppercase tracking-wider font-bold">
                Online Partner Rentals
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Premium Gear.<br />
                <span className="text-blue-600">Delivered to you.</span>
              </h1>
              <p className="text-slate-500 text-base sm:text-lg mt-4 leading-relaxed">
                Rent specialized film gear, cinema cameras, high-end electronics, power tools, and party systems directly from verified rental partners with insured doorstep delivery.
              </p>
            </div>

            {/* Track Recent Orders Quick Action */}
            {onlineRentalOrders.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setActiveTrackingOrder(onlineRentalOrders[0])}
                className="shrink-0 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold flex items-center gap-2 h-12 px-6 rounded-full shadow-sm transition-all hover:shadow"
              >
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Track Active Rental ({onlineRentalOrders.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-3 sm:p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search cinema cameras, VR headsets, camping tents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-none bg-slate-50 text-slate-900 text-[15px] font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 bg-slate-200/50 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center w-full md:w-auto">
              <div className="flex items-center gap-2 px-4 py-3.5 bg-slate-50 rounded-2xl w-full md:w-48 hover:bg-slate-100 transition-colors cursor-pointer group">
                <ArrowUpDown className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-sm text-slate-700 font-semibold focus:outline-none cursor-pointer w-full appearance-none"
                >
                  <option value="popular">Popularity</option>
                  <option value="rating">Highest Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar text-sm">
            <span className="text-slate-400 font-semibold shrink-0 mr-2 flex items-center gap-1.5 uppercase text-xs tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              Categories
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Explore Rentals
            <span className="bg-slate-100 text-slate-600 text-sm py-0.5 px-2.5 rounded-full font-semibold">
              {filteredItems.length}
            </span>
          </h2>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-blue-600 font-semibold text-sm hover:text-blue-700 hover:underline transition-all"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Grid of Partner Rental Cards */}
        {isLoading ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-slate-200"></div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <div className="h-8 bg-slate-200 rounded w-24"></div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-slate-200 rounded w-20"></div>
                      <div className="h-10 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty State
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl text-center py-20 px-4 space-y-5 max-w-2xl mx-auto shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Store className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No items found</h3>
              <p className="text-slate-500 text-base max-w-md mx-auto">
                We couldn't find any rental equipment matching your search. Try checking a different category or adjust your keywords.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="font-bold border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          // Product Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all">
            {filteredItems.map((item: any) => (
              <ProductCard
                key={item.id}
                item={item}
                isWishlisted={isWishlisted(item.id)}
                onToggleWishlist={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item.id);
                }}
                onView={() => setActiveDetailItem(item)}
                onRent={(e) => {
                  e.stopPropagation();
                  handleOpenBooking(item);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
