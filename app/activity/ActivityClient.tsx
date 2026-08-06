'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  ArrowRight,
  CheckCircle2,
  Inbox,
  Check,
  X,
  User,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  Tag,
  Camera,
  Edit,
  Trash2,
  Eye,
  Plus,
  Package,
  ShieldCheck,
  Globe,
  PlusCircle
} from 'lucide-react';
import { formatRupee, getItemImage, getCategoryFallbackImage } from '@/lib/format';
import { SmartCheckInModal } from '@/components/activity/SmartCheckInModal';
import { ComparisonView } from '@/components/activity/ComparisonView';
import { EditItemModal } from '@/components/activity/EditItemModal';

type BorrowStatus = 'REQUESTED' | 'ACCEPTED' | 'PICKED_UP' | 'RETURNED' | 'DECLINED';
const pipelineSteps: BorrowStatus[] = ['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'RETURNED'];

type ActivityTab = 'ALL' | 'BORROWING' | 'LENDING' | 'LISTINGS';

export default function ActivityClient() {
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState<ActivityTab>('ALL');
  const [borrowRequests, setBorrowRequests] = useState<any[]>([]);
  const [lendRequests, setLendRequests] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [checkInModalProps, setCheckInModalProps] = useState<{ borrowId: string, stage: 'before'|'after' } | null>(null);
  const [comparisonBorrowId, setComparisonBorrowId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const fetchActivityData = async () => {
    try {
      setIsLoading(true);
      const [borrowRes, lendRes, listingsRes] = await Promise.all([
        fetch('/api/requests/borrowing'),
        fetch('/api/requests/lending'),
        fetch('/api/items?mine=true'),
      ]);

      if (borrowRes.ok) setBorrowRequests(await borrowRes.json());
      if (lendRes.ok) setLendRequests(await lendRes.json());
      
      let dbListings: any[] = [];
      if (listingsRes.ok) {
        dbListings = await listingsRes.json();
      }

      setMyListings(dbListings);
    } catch (error) {
      console.error('Failed to fetch activity data', error);
      addToast('Error', 'Failed to load activity data.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const getStatusStepIndex = (status: BorrowStatus) => {
    return pipelineSteps.indexOf(status);
  };

  const handleUpdateBorrowStatus = async (id: string, newStatus: BorrowStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast('Error', data.error?.message || 'Failed to update status', 'warning');
        return;
      }

      addToast('Success', `Status updated to ${newStatus}`);
      fetchActivityData();
    } catch (error) {
      console.error('Failed to update status', error);
      addToast('Error', 'An unexpected error occurred.', 'warning');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickStatusChange = async (itemId: string, newStatus: string) => {
    setActionLoading(`status-${itemId}`);
    try {
      const isAvailable = newStatus === 'Available';
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus, isAvailable }),
      });

      if (!res.ok) {
        addToast('Error', 'Failed to update listing status', 'warning');
        return;
      }

      addToast('Listing Updated', `Item status changed to ${newStatus}`);
      fetchActivityData();
    } catch (err) {
      console.error('Failed to change status', err);
      addToast('Error', 'Failed to update status', 'warning');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteListing = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(`delete-${itemId}`);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Listing Deleted', `"${itemName}" was removed from your listings.`, 'info');
        fetchActivityData();
      } else {
        addToast('Error', 'Failed to delete listing', 'error');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete listing', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate">Loading your activity dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {checkInModalProps && (
        <SmartCheckInModal
          borrowId={checkInModalProps.borrowId}
          stage={checkInModalProps.stage}
          onCancel={() => setCheckInModalProps(null)}
          onComplete={() => {
            const nextStatus = checkInModalProps.stage === 'before' ? 'PICKED_UP' : 'RETURNED';
            handleUpdateBorrowStatus(checkInModalProps.borrowId, nextStatus);
            setCheckInModalProps(null);
          }}
        />
      )}

      {comparisonBorrowId && (
        <ComparisonView
          borrowId={comparisonBorrowId}
          onClose={() => setComparisonBorrowId(null)}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            addToast('Saved', 'Listing details updated successfully.');
            fetchActivityData();
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="marigold" className="mb-2">Activity Dashboard</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            My Activity & Listings
          </h1>
          <p className="text-slate mt-1">
            Track active borrow requests, manage incoming lending requests, and edit your published item listings.
          </p>
        </div>

        <Link href="/list">
          <Button variant="accent" size="sm" className="shadow-sm flex items-center gap-1.5 shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span>List New Item</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-ink/10 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: 'All Activity', count: borrowRequests.length + lendRequests.length + myListings.length },
          { id: 'BORROWING', label: "Things I'm Borrowing", count: borrowRequests.length },
          { id: 'LENDING', label: "Things I'm Lending", count: lendRequests.length },
          { id: 'LISTINGS', label: 'My Listings', count: myListings.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActivityTab)}
            className={`px-4 py-2 rounded-xl text-sm font-display font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-paper text-slate hover:text-ink hover:bg-ink/5 border border-ink/10'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-data font-semibold ${
              activeTab === tab.id ? 'bg-marigold text-ink' : 'bg-ink/10 text-ink'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: MY LISTINGS */}
      {(activeTab === 'ALL' || activeTab === 'LISTINGS') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-moss" />
              <h2 className="font-display font-bold text-xl text-ink">
                My Listings ({myListings.length})
              </h2>
            </div>
            <Link href="/list">
              <Button variant="ghost" size="sm" className="text-moss hover:bg-moss/10 font-bold">
                + Add Another Item
              </Button>
            </Link>
          </div>

          {myListings.length === 0 ? (
            <Card variant="outline" className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-moss/10 text-moss flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink">No items published yet</h3>
              <p className="text-xs text-slate max-w-sm mx-auto">
                You haven't listed any items for borrowing or rental. Earn extra income by sharing your idle tools and equipment with neighbours!
              </p>
              <div className="pt-2 flex justify-center">
                <Link href="/list">
                  <Button variant="primary" size="sm">List Your First Item</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((item) => {
                const thumbnail = getItemImage(item);
                const status = item.availabilityStatus || (item.isAvailable ? 'Available' : 'Unavailable');
                const requestsCount = item._count?.borrowRequests || 0;

                const getStatusBadgeVariant = (st: string) => {
                  switch (st) {
                    case 'Available': return 'moss';
                    case 'Rented': return 'clay';
                    case 'Sold Out': return 'marigold';
                    default: return 'slate';
                  }
                };

                return (
                  <Card key={item.id} variant="interactive" className="flex flex-col justify-between p-0 overflow-hidden border-ink/10">
                    <div className="relative h-44 w-full bg-ink/5 border-b border-ink/10 flex-shrink-0">
                      <img
                        src={thumbnail}
                        alt={item.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.category, item.name); }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={getStatusBadgeVariant(status)} className="shadow-sm backdrop-blur-md bg-white/90">
                          {status}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge variant="outline" className="shadow-sm backdrop-blur-md bg-white/90 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-lg text-ink leading-tight line-clamp-1">
                          {item.name}
                        </h3>
                        
                        {item.description && (
                          <p className="text-xs text-slate line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs font-data pt-2 border-t border-ink/10">
                          <span className="text-slate">Requests Received:</span>
                          <span className="font-bold text-ink bg-ink/5 px-2 py-0.5 rounded-full">
                            {requestsCount} requests
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-ink/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-data text-slate block">Daily Rate</span>
                            <span className="font-data font-bold text-lg text-moss">{formatRupee(item.pricePerDay)}</span>
                          </div>
                          {item.pricePerHour && (
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-data text-slate block">Hourly Rate</span>
                              <span className="font-data font-bold text-sm text-ink">{formatRupee(item.pricePerHour)}</span>
                            </div>
                          )}
                        </div>

                        {/* Owner Quick Actions */}
                        <div className="space-y-2 pt-2 border-t border-ink/10">
                          <div className="flex items-center justify-between gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs font-bold"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              <span>Edit Details</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 p-2"
                              isLoading={actionLoading === `delete-${item.id}`}
                              onClick={() => handleDeleteListing(item.id, item.name)}
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Quick Status Toggles */}
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item.id, 'Available')}
                              className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                status === 'Available'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-50 text-slate hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              Available
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item.id, 'Unavailable')}
                              className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                status === 'Unavailable'
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-slate-50 text-slate hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              Unavailable
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(item.id, 'Sold Out')}
                              className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                status === 'Sold Out'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-slate-50 text-slate hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              Sold Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TWO COLUMN LAYOUT: BORROWING & LENDING */}
      <div className={`grid grid-cols-1 ${activeTab === 'ALL' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8 items-start`}>
        {/* LEFT COLUMN: Things I'm borrowing */}
        {(activeTab === 'ALL' || activeTab === 'BORROWING') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-moss" />
                <h2 className="font-display font-bold text-xl text-ink">
                  Things I'm Borrowing ({borrowRequests.length})
                </h2>
              </div>
              <Badge variant="moss">{borrowRequests.length} active</Badge>
            </div>

            {borrowRequests.length === 0 ? (
              <Card variant="outline" className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-moss/10 text-moss flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-ink">Nothing borrowed yet</h3>
                <p className="text-xs text-slate max-w-sm mx-auto">
                  You haven't requested any items. Explore neighbourhood listings or store partner rentals.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link href="/browse"><Button variant="primary" size="sm">Browse Neighbourhood</Button></Link>
                  <Link href="/online"><Button variant="clay" size="sm">Online Store</Button></Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {borrowRequests.map((req) => {
                  const currentStepIdx = getStatusStepIndex(req.status);
                  const isCompleted = req.status === 'RETURNED' || req.status === 'DECLINED';
                  const canAdvance = !isCompleted && req.status !== 'REQUESTED' && currentStepIdx >= 0 && currentStepIdx < pipelineSteps.length - 1;

                  return (
                    <Card key={req.id} variant="interactive" className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg text-ink">{req.item.name}</h3>
                            {req.item.source === 'ONLINE' && <Badge variant="clay" size="sm">Partner Delivery</Badge>}
                          </div>
                          <p className="text-xs text-slate mt-0.5 font-data">
                            Lender: <strong className="text-ink">{req.item.owner?.name || req.item.platformName}</strong>
                          </p>
                          {req.item.marketPrice && (
                            <div className="flex items-center gap-1 text-[10px] text-slate mt-2 font-data">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span>Market Value: <strong>{formatRupee(req.item.marketPrice)}</strong></span>
                            </div>
                          )}
                        </div>
                        <Badge variant={req.status === 'RETURNED' ? 'slate' : req.status === 'PICKED_UP' ? 'moss' : 'marigold'}>
                          {req.status}
                        </Badge>
                      </div>

                      {req.startDate && req.endDate && (
                        <div className="flex items-center gap-2 text-xs font-data text-slate bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formatDate(req.startDate)} <ArrowRight className="w-3 h-3 inline mx-1" /> {formatDate(req.endDate)}</span>
                        </div>
                      )}

                      {req.status !== 'DECLINED' && (
                        <div className="space-y-2 bg-paper/60 p-4 rounded-xl border border-ink/10">
                          <div className="flex items-center justify-between text-xs font-data font-semibold text-slate mb-1">
                            <span>Status Lifecycle</span>
                            <span className="text-moss font-bold">Est: {formatRupee(req.estimatedCost || 0)}</span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 relative">
                            {pipelineSteps.map((step, idx) => {
                              const isReached = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;
                              return (
                                <div key={step} className="flex flex-col items-center gap-1.5 text-center">
                                  <div className={`w-full h-2.5 rounded-full transition-all duration-500 ${isReached ? (isCurrent ? 'bg-marigold shadow-sm ring-2 ring-marigold/40' : 'bg-moss') : 'bg-ink/10'}`} />
                                  <span className={`text-[10px] font-data font-medium transition-colors ${isCurrent ? 'text-ink font-bold' : isReached ? 'text-moss' : 'text-slate/60'}`}>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {req.penaltyAmount > 0 && req.status === 'RETURNED' && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-900">Late Return Penalty</p>
                            <p className="text-xs text-amber-700 mt-0.5">You were charged an additional <strong>{formatRupee(req.penaltyAmount)}</strong> for returning this item late.</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-slate">
                          {isCompleted ? `This request is ${req.status}.` : req.status === 'REQUESTED' ? 'Awaiting lender approval.' : `Current step: ${req.status}`}
                        </p>
                        
                        <div className="flex gap-2">
                          {req.status === 'RETURNED' && (
                            <Button variant="outline" size="sm" onClick={() => setComparisonBorrowId(req.id)}>
                              <Camera className="w-4 h-4 mr-2" />
                              Visual History
                            </Button>
                          )}
                          
                          {canAdvance && req.status === 'ACCEPTED' && (
                            <Button variant="accent" size="sm" onClick={() => setCheckInModalProps({ borrowId: req.id, stage: 'before' })}>
                              <Camera className="w-4 h-4 mr-2" /> Start Before Check-in
                            </Button>
                          )}

                          {canAdvance && req.status === 'PICKED_UP' && (
                            <Button variant="accent" size="sm" onClick={() => setCheckInModalProps({ borrowId: req.id, stage: 'after' })}>
                              <Camera className="w-4 h-4 mr-2" /> Start Return Check-in
                            </Button>
                          )}
                          
                          {canAdvance && req.status !== 'ACCEPTED' && req.status !== 'PICKED_UP' && (
                            <Button
                              variant="accent"
                              size="sm"
                              isLoading={actionLoading === req.id}
                              onClick={() => handleUpdateBorrowStatus(req.id, pipelineSteps[currentStepIdx + 1])}
                            >
                              <span>Advance to "{pipelineSteps[currentStepIdx + 1]}"</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: Things I'm lending */}
        {(activeTab === 'ALL' || activeTab === 'LENDING') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-marigold" />
                <h2 className="font-display font-bold text-xl text-ink">
                  Things I'm Lending ({lendRequests.length})
                </h2>
              </div>
              <Badge variant="marigold">{lendRequests.length} requests</Badge>
            </div>

            {lendRequests.length === 0 ? (
              <Card variant="outline" className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-marigold/20 text-ink flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-ink">No lending requests yet</h3>
                <p className="text-xs text-slate max-w-sm mx-auto">
                  No neighbours have requested your items yet. List an item to receive requests.
                </p>
                <div className="pt-2 flex justify-center">
                  <Link href="/list"><Button variant="accent" size="sm">List a New Item</Button></Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {lendRequests.map((req) => (
                  <Card key={req.id} variant="interactive" className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-bold text-lg text-ink">{req.item.name}</h3>
                        <p className="text-xs text-slate mt-0.5 font-data">
                          Borrower: <strong className="text-ink">{req.borrower?.name}</strong>
                        </p>
                        {req.item.marketPrice && (
                          <div className="flex items-center gap-1 text-[10px] text-slate mt-2 font-data">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>Market Value: <strong>{formatRupee(req.item.marketPrice)}</strong></span>
                          </div>
                        )}
                      </div>
                      <Badge variant={req.status === 'ACCEPTED' ? 'moss' : 'marigold'}>{req.status}</Badge>
                    </div>

                    {req.startDate && req.endDate && (
                      <div className="flex items-center gap-2 text-xs font-data text-slate bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(req.startDate)} <ArrowRight className="w-3 h-3 inline mx-1" /> {formatDate(req.endDate)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate font-data bg-paper/60 p-3 rounded-xl border border-ink/10">
                      <span className="text-slate">Estimated Return:</span>
                      <span className="font-bold text-moss">{formatRupee(req.estimatedCost || 0)}</span>
                    </div>

                    {req.penaltyAmount > 0 && req.status === 'RETURNED' && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">Late Return Penalty Collected</p>
                          <p className="text-xs text-amber-700 mt-0.5">Borrower was charged an additional <strong>{formatRupee(req.penaltyAmount)}</strong>.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      {req.status === 'REQUESTED' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            isLoading={actionLoading === `${req.id}-decline`}
                            onClick={() => {
                              setActionLoading(`${req.id}-decline`);
                              handleUpdateBorrowStatus(req.id, 'DECLINED').then(() => setActionLoading(null));
                            }}
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={actionLoading === `${req.id}-accept`}
                            onClick={() => {
                              setActionLoading(`${req.id}-accept`);
                              handleUpdateBorrowStatus(req.id, 'ACCEPTED').then(() => setActionLoading(null));
                            }}
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Request</span>
                          </Button>
                        </>
                      ) : req.status === 'DECLINED' ? (
                        <div className="text-xs font-semibold text-slate font-data">Request Declined</div>
                      ) : req.status === 'RETURNED' ? (
                         <Button variant="outline" size="sm" onClick={() => setComparisonBorrowId(req.id)}>
                           <Camera className="w-4 h-4 mr-2" /> Visual History
                         </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-moss font-data">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accepted — Currently {req.status}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
