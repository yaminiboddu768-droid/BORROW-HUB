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
  Camera
} from 'lucide-react';
import { formatRupee } from '@/lib/format';
import { SmartCheckInModal } from '@/components/activity/SmartCheckInModal';
import { ComparisonView } from '@/components/activity/ComparisonView';

type BorrowStatus = 'REQUESTED' | 'ACCEPTED' | 'PICKED_UP' | 'RETURNED' | 'DECLINED';
const pipelineSteps: BorrowStatus[] = ['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'RETURNED'];

export default function ActivityClient() {
  const { addToast } = useApp();

  const [borrowRequests, setBorrowRequests] = useState<any[]>([]);
  const [lendRequests, setLendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [checkInModalProps, setCheckInModalProps] = useState<{ borrowId: string, stage: 'before'|'after' } | null>(null);
  const [comparisonBorrowId, setComparisonBorrowId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const [borrowRes, lendRes] = await Promise.all([
        fetch('/api/requests/borrowing'),
        fetch('/api/requests/lending'),
      ]);

      if (borrowRes.ok) setBorrowRequests(await borrowRes.json());
      if (lendRes.ok) setLendRequests(await lendRes.json());
    } catch (error) {
      console.error('Failed to fetch requests', error);
      addToast('Error', 'Failed to load activity data.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusStepIndex = (status: BorrowStatus) => {
    return pipelineSteps.indexOf(status);
  };

  const handleUpdateStatus = async (id: string, newStatus: BorrowStatus) => {
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
      fetchRequests();
    } catch (error) {
      console.error('Failed to update status', error);
      addToast('Error', 'An unexpected error occurred.', 'warning');
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
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate">Loading your activity...</div>;
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
            handleUpdateStatus(checkInModalProps.borrowId, nextStatus);
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

      {/* Header */}
      <div>
        <Badge variant="marigold" className="mb-2">Activity Dashboard</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
          My Borrow & Lend Pipeline
        </h1>
        <p className="text-slate mt-1">
          Track active borrow requests, advance pickup/return stages, and manage incoming lending requests.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Things I'm borrowing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-moss" />
              <h2 className="font-display font-bold text-xl text-ink">
                Things I'm Borrowing
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
                            onClick={() => handleUpdateStatus(req.id, pipelineSteps[currentStepIdx + 1])}
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

        {/* RIGHT COLUMN: Things I'm lending */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-marigold" />
              <h2 className="font-display font-bold text-xl text-ink">Things I'm Lending</h2>
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
                            handleUpdateStatus(req.id, 'DECLINED').then(() => setActionLoading(null));
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
                            handleUpdateStatus(req.id, 'ACCEPTED').then(() => setActionLoading(null));
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
      </div>
    </div>
  );
}
