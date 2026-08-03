'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/lib/AppContext';
import { CheckCircle2, XCircle, Search, ClipboardList, Camera, QrCode } from 'lucide-react';

const TABS = ['Pending', 'Approved', 'Active', 'Return Requests', 'Completed', 'Cancelled'];

export default function RequestsPage() {
  const { addToast } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [verifyModal, setVerifyModal] = useState<any | null>(null);
  const [damageLevel, setDamageLevel] = useState('none');
  const [verifying, setVerifying] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partner/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: string, payload: any = {}) => {
    try {
      if (action === 'verify-return') setVerifying(true);
      const res = await fetch(`/api/partner/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.ok) {
        addToast('Success', `Request updated successfully.`);
        setVerifyModal(null);
        fetchRequests();
      } else {
        throw new Error('Failed action');
      }
    } catch (error) {
      addToast('Error', 'Action failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const getFilteredRequests = () => {
    const tabMapping: Record<string, string> = {
      'Pending': 'pending',
      'Approved': 'approved',
      'Active': 'active',
      'Return Requests': 'return_requested',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
    };
    const targetStatus = tabMapping[activeTab];
    return requests.filter(r => r.status === targetStatus);
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-display text-ink">Requests Management</h1>
      </div>

      <Card variant="default" className="p-4 sm:p-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto bg-slate-100 p-1 rounded-lg mb-6 hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? 'bg-white shadow text-ink' : 'text-slate-500 hover:text-ink'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-slate">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-ink font-medium">No {activeTab.toLowerCase()} requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                <div>
                  <p className="font-bold text-ink text-lg">{req.item.name}</p>
                  <p className="text-sm font-medium text-slate">
                    Requested by <span className="text-ink">{req.borrower.name}</span> (⭐ {req.borrower.averageRating?.toFixed(1) || 'New'})
                  </p>
                  <p className="text-xs text-slate mt-1">
                    Dates: {req.startDate ? new Date(req.startDate).toLocaleDateString() : 'N/A'} - {req.endDate ? new Date(req.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <p className="text-sm font-bold text-ink">₹{req.estimatedCost}</p>
                    <p className="text-xs text-slate">Total</p>
                  </div>
                  
                  {req.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleAction(req.id, 'reject')}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="accent" onClick={() => handleAction(req.id, 'accept')}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                      </Button>
                    </>
                  )}

                  {req.status === 'return_requested' && (
                    <Button size="sm" variant="accent" onClick={() => setVerifyModal(req)}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Verify Return
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Verification UI Modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
          <Card variant="default" className="w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold font-display text-ink border-b border-slate-100 pb-4">
              Return Verification: {verifyModal.item.name}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-center py-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-marigold mx-auto mb-2" />
                  <p className="text-sm font-medium text-ink">Simulate QR Scan</p>
                  <p className="text-xs text-slate mt-1">Scan item to confirm physical return.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Check Item Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Camera className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-medium">Before (Sent)</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100">
                    <Camera className="w-6 h-6 text-marigold mb-2" />
                    <span className="text-xs font-medium">Take Photo Now</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Damage Log</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-200"
                  value={damageLevel}
                  onChange={(e) => setDamageLevel(e.target.value)}
                >
                  <option value="none">No Damage</option>
                  <option value="minor">Minor Wear & Tear (Penalty: ₹200)</option>
                  <option value="major">Major Damage (Penalty: ₹1000)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setVerifyModal(null)} disabled={verifying}>Cancel</Button>
              <Button variant="accent" isLoading={verifying} onClick={() => handleAction(verifyModal.id, 'verify-return', { damageCheck: damageLevel })}>
                Complete Return
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
