'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { RadarVisual } from '@/components/browse/RadarVisual';
const InteractiveMap = dynamic(() => import('@/components/browse/InteractiveMap'), { ssr: false });
import { ItemRequestModal } from '@/components/browse/ItemRequestModal';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Wrench,
  Sparkles,
  Utensils,
  Tv,
  Bike,
  Waves,
  ChefHat,
  Flame,
  Radio,
  BookOpen,
  PackageX,
  Compass,
  Tent,
  Camera,
  Image as ImageIcon,
  Tag
} from 'lucide-react';

export default function BrowsePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useApp();

  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(3.0);
  const [viewMode, setViewMode] = useState<'RADAR' | 'MAP'>('RADAR');
  
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<any | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const categories = [
    'All', 'TOOLS', 'ELECTRONICS', 'SPORTS', 'COOKWARE', 'BOOKS', 'OUTDOORS', 
    'FURNITURE', 'TRAVEL', 'PARTY', 'FITNESS', 'VEHICLES', 'APPLIANCES', 'OTHER'
  ];

  const { data: queryItems, isLoading, error } = useQuery({
    queryKey: ['items', 'NEIGHBOUR', selectedCategory, searchQuery],
    queryFn: async () => {
      const url = new URL('/api/items', window.location.origin);
      url.searchParams.append('source', 'NEIGHBOUR');
      if (selectedCategory !== 'All') url.searchParams.append('category', selectedCategory);
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    }
  });

  useEffect(() => {
    if (queryItems) {
      setItems(queryItems);
    }
  }, [queryItems]);

  const getCategoryIcon = (iconName: string, className = "w-8 h-8 text-white/50") => {
    switch (iconName) {
      case 'Wrench': return <Wrench className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'Tv': return <Tv className={className} />;
      case 'Bike': return <Bike className={className} />;
      case 'Waves': return <Waves className={className} />;
      case 'ChefHat': return <ChefHat className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Book': return <BookOpen className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Tent': return <Tent className={className} />;
      case 'Camera': return <Camera className={className} />;
      case 'Trophy': return <Bike className={className} />;
      default: return <Wrench className={className} />;
    }
  };

  const handleOpenRequest = (item: any) => {
    if (!session) {
      addToast('Login required', 'You must be logged in to request items.', 'warning');
      router.push('/login?callbackUrl=/browse');
      return;
    }
    setSelectedItemForRequest(item);
  };

  const handleConfirmRequest = async (startDate: Date, endDate: Date, estimatedCost: number) => {
    if (!selectedItemForRequest) return;
    setRequestLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: selectedItemForRequest.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          estimatedCost
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('Request failed', data.error?.message || 'Failed to borrow item.', 'warning');
        return;
      }

      addToast('Borrow Request Sent', `Request sent to ${selectedItemForRequest.owner.name} for ${selectedItemForRequest.name}. Check My Activity for updates.`);
      setSelectedItemForRequest(null);
    } catch (error) {
      console.error('Failed to request item', error);
      addToast('Error', 'An unexpected error occurred.', 'warning');
    } finally {
      setRequestLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    // Hide logged in user's own items from Browse Neighbourhood
    const isOwnItem =
      (session?.user?.id && item.ownerId === session.user.id) ||
      (session?.user?.id && item.owner?.id === session.user.id) ||
      item.ownerName === 'You' ||
      item.owner?.name === 'You';

    if (isOwnItem) return false;

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRadius = item.distanceKm <= radiusKm;

    return matchesCategory && matchesSearch && matchesRadius;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {selectedItemForRequest && (
        <ItemRequestModal 
          item={selectedItemForRequest}
          onClose={() => setSelectedItemForRequest(null)}
          onSubmit={handleConfirmRequest}
          isLoading={requestLoading}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="moss" className="mb-2">Neighbourhood Marketplace</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">Browse Nearby Items</h1>
          <p className="text-slate mt-1">
            Borrow tools, kitchenware, and gear directly from trusted neighbours within your walking radius.
          </p>
        </div>

        <div className="flex bg-ink/5 p-1 rounded-full w-fit border border-ink/10">
          <button
            onClick={() => setViewMode('RADAR')}
            className={`px-4 py-2 rounded-full text-sm font-display font-medium transition-all flex items-center gap-2 ${
              viewMode === 'RADAR' ? 'bg-white text-moss shadow-sm' : 'text-slate hover:text-ink'
            }`}
          >
            <Compass className="w-4 h-4" />
            Radar View
          </button>
          <button
            onClick={() => setViewMode('MAP')}
            className={`px-4 py-2 rounded-full text-sm font-display font-medium transition-all flex items-center gap-2 ${
              viewMode === 'MAP' ? 'bg-white text-moss shadow-sm' : 'text-slate hover:text-ink'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Map View
          </button>
        </div>
      </div>

      {viewMode === 'RADAR' ? (
        <RadarVisual items={items} radiusKm={radiusKm} />
      ) : (
        <InteractiveMap items={filteredItems} onOpenRequest={handleOpenRequest} radiusKm={radiusKm} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-ink/10 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center gap-2 border-b border-ink/10 pb-3">
            <Filter className="w-5 h-5 text-moss" />
            <h2 className="font-display font-bold text-lg text-ink">Filters</h2>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-medium text-sm text-ink flex items-center justify-between">
              <span>Search Items</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-slate hover:text-ink underline">
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Drill, Le Creuset, Projector..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-moss" />
                <span>Distance Radius</span>
              </label>
              <span className="font-data font-bold text-sm text-moss px-2 py-0.5 rounded-md bg-moss/10">
                {radiusKm.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-moss cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] font-data text-slate">
              <span>0.5 km (5-min walk)</span>
              <span>5.0 km (Max range)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-display font-medium text-sm text-ink">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-moss text-paper shadow-sm font-semibold'
                      : 'bg-paper text-ink border border-ink/15 hover:bg-ink/10'
                  }`}
                >
                  {cat === 'All' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-ink/10 flex items-center justify-between text-xs text-slate font-data">
            <span>Showing {filteredItems.length} of {items.length} items</span>
            {(selectedCategory !== 'All' || searchQuery || radiusKm !== 3.0) && (
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setRadiusKm(3.0); }}
                className="text-moss font-semibold hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-80 bg-ink/5 rounded-2xl border border-ink/10"></div>
               ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 text-center border border-dashed border-ink/20 space-y-4 my-4">
              <div className="w-16 h-16 rounded-full bg-marigold/20 text-ink mx-auto flex items-center justify-center">
                <PackageX className="w-8 h-8 text-ink/70" />
              </div>
              <h3 className="text-2xl font-bold font-display text-ink">No items found in this range</h3>
              <p className="text-slate text-sm max-w-md mx-auto">
                No neighbourhood items matched your current filters. Try widening your distance radius or searching for another category.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="primary" onClick={() => setRadiusKm(5.0)}>Expand Radius to 5km</Button>
                <Button variant="outline" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setRadiusKm(5.0); }}>Clear All Filters</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const borrowProgressPct = Math.min((item.timesBorrowed / 35) * 100, 100);
                const thumbnail = getItemImage(item);

                return (
                  <Card key={item.id} variant="interactive" className="flex flex-col justify-between overflow-hidden p-0 border-ink/10" onClick={() => handleOpenRequest(item)}>
                    
                    {/* Dominant Image Header */}
                    <div className="relative h-48 w-full bg-ink/5 border-b border-ink/10 flex-shrink-0 cursor-pointer">
                      <img 
                        src={thumbnail} 
                        alt={item.name} 
                        onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name); }}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="moss" className="shadow-sm backdrop-blur-md bg-white/90">
                          {item.distanceKm} km
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge variant="outline" className="shadow-sm backdrop-blur-md bg-white/90">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <div className="space-y-3 flex-grow">
                        <div>
                          <h3 className="font-display font-bold text-lg text-ink group-hover:text-moss transition-colors leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                          {item.description && <p className="text-xs text-slate mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate font-data pt-1">
                          <span className="font-medium text-ink">Lender: {item.owner?.name || 'Unknown'}</span>
                          <div className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{item.owner?.averageRating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-data text-slate">
                            <span>Community Trust</span>
                            <span className="font-semibold text-ink">{item.timesBorrowed} times borrowed</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-ink/10 overflow-hidden">
                            <div className="h-full bg-moss rounded-full transition-all duration-500" style={{ width: `${borrowProgressPct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-ink/10 mt-4">
                        {item.marketPrice && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate font-data bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 w-fit mb-3">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>Market Value: <strong className="text-ink">{formatRupee(item.marketPrice)}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex gap-4">
                            {item.pricePerHour && (
                              <div>
                                <span className="text-[10px] uppercase font-data text-slate block">Per Hour</span>
                                <span className="font-data font-bold text-sm text-ink">{formatRupee(item.pricePerHour)}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] uppercase font-data text-slate block">Daily Rate</span>
                              <span className="font-data font-bold text-xl text-moss">{formatRupee(item.pricePerDay)}</span>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRequest(item);
                            }}
                          >
                            Request
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
