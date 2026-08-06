'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminBusinessVerificationPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved'>('Pending');
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const queryClient = useQueryClient();

  const { data: kycList = [], isLoading } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: async () => {
      const res = await fetch('/api/admin/kyc');
      if (!res.ok) throw new Error('Failed to fetch KYC requests');
      return res.json();
    }
  });

  const updateKycMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string, status: string, rejectionReason?: string }) => {
      const res = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectionReason })
      });
      if (!res.ok) throw new Error('Failed to update KYC');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      if (data.status === 'APPROVED') {
        showToast(`Approved KYC and issued Verified Partner Badge for "${selectedKyc?.businessName || data.id}".`);
      } else {
        showToast(`Rejected KYC request for "${selectedKyc?.businessName || data.id}".`);
      }
      setSelectedKyc(null);
      setRejectionReason('');
    }
  });

  const filteredList = kycList.filter((item: any) => {
    if (activeTab === 'Pending' && item.status !== 'PENDING') return false;
    if (activeTab === 'Approved' && item.status !== 'APPROVED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.businessName.toLowerCase().includes(q) ||
        (item.user?.name && item.user.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = (id: string) => {
    updateKycMutation.mutate({ id, status: 'APPROVED' });
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection.');
      return;
    }
    updateKycMutation.mutate({ id, status: 'REJECTED', rejectionReason });
  };



  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink border border-marigold/50 text-paper p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-moss shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-marigold font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>KYC Verification Desk</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Business Partner Verification
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Verify official trade licenses, GST registration, storefront authenticity, and risk scores.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-paper/10 p-1.5 rounded-2xl border border-paper/15">
          {(['Pending', 'Approved', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab ? 'bg-marigold text-ink font-bold shadow' : 'text-paper/70 hover:text-paper'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by business name, owner, GSTIN number, or city..."
          className="w-full pl-10 pr-4 py-3 text-xs bg-paper/10 border border-paper/15 rounded-2xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition-all"
        />
      </div>

      {/* Table / Card List */}
      <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper/5 text-paper/60 uppercase font-data border-b border-paper/10">
              <tr>
                <th className="px-6 py-4">Business Details</th>
                <th className="px-6 py-4">Category & City</th>
                <th className="px-6 py-4">GSTIN & Reg #</th>
                <th className="px-6 py-4">Risk Rating</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/10 text-paper">
              {filteredList.map((kyc: any) => (
                <tr key={kyc.id} className="hover:bg-paper/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-paper">{kyc.businessName}</div>
                    <div className="text-xs text-paper/60">Owner: {kyc.user?.name || 'N/A'} • {kyc.user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div>N/A</div>
                    <div className="text-paper/50 font-data">N/A</div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <div className="text-marigold font-bold">{kyc.taxId || 'N/A'}</div>
                    <div className="text-paper/50">{kyc.registrationNumber}</div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        kyc.riskScore && kyc.riskScore < 30 ? 'bg-moss/20 text-moss' :
                        kyc.riskScore && kyc.riskScore < 60 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}
                    >
                      Risk: {kyc.riskScore || 'Low'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                        kyc.status === 'APPROVED'
                          ? 'bg-moss/20 text-moss border border-moss/30'
                          : kyc.status === 'PENDING'
                          ? 'bg-marigold/20 text-marigold border border-marigold/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {kyc.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {kyc.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                      {kyc.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                      <span>{kyc.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedKyc(kyc)}
                      className="px-3.5 py-1.5 rounded-xl bg-marigold text-ink font-display font-bold hover:bg-marigold-hover transition-colors flex items-center gap-1.5 ml-auto shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Docs</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-paper/50 font-data">
                    No business partner KYC applications found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Documents Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#182326] border border-paper/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-paper/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-data text-marigold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KYC Review & Verification Inspection</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-paper mt-1">
                  {selectedKyc.businessName}
                </h2>
                <p className="text-xs text-paper/70">
                  Store Address: {selectedKyc.storeAddress}, {selectedKyc.city}
                </p>
              </div>

              <button
                onClick={() => setSelectedKyc(null)}
                className="text-paper/50 hover:text-paper p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-paper/5 border border-paper/10 font-data text-xs">
              <div>
                <span className="text-paper/50 block">GSTIN</span>
                <span className="text-marigold font-bold">{selectedKyc.gstin}</span>
              </div>
              <div>
                <span className="text-paper/50 block">Reg Number</span>
                <span className="text-paper font-bold">{selectedKyc.registrationNumber}</span>
              </div>
              <div>
                <span className="text-paper/50 block">Category</span>
                <span className="text-paper font-bold">{selectedKyc.category}</span>
              </div>
              <div>
                <span className="text-paper/50 block">Contact Phone</span>
                <span className="text-paper font-bold">{selectedKyc.phone}</span>
              </div>
            </div>

            {/* Uploaded Documents Grid */}
            <div>
              <h3 className="font-display font-bold text-sm text-paper mb-3">
                Uploaded Verification Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10">
                  <span className="text-xs font-bold text-paper block mb-2">1. GST Certificate</span>
                  <img
                    src={selectedKyc.documents.gstCertificate}
                    alt="GST Doc"
                    className="w-full h-40 object-cover rounded-xl border border-paper/20"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10">
                  <span className="text-xs font-bold text-paper block mb-2">2. Trade License</span>
                  <img
                    src={selectedKyc.documents.tradeLicense}
                    alt="Trade License"
                    className="w-full h-40 object-cover rounded-xl border border-paper/20"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10">
                  <span className="text-xs font-bold text-paper block mb-2">3. Authorized Owner ID</span>
                  <img
                    src={selectedKyc.documents.identityProof}
                    alt="Owner ID"
                    className="w-full h-40 object-cover rounded-xl border border-paper/20"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10">
                  <span className="text-xs font-bold text-paper block mb-2">4. Physical Storefront Photo</span>
                  <img
                    src={selectedKyc.documents.storefrontPhoto}
                    alt="Storefront"
                    className="w-full h-40 object-cover rounded-xl border border-paper/20"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-paper/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              {selectedKyc.status === 'Pending' ? (
                <>
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Optional reason if rejecting (e.g. GSTIN blur, invalid license)..."
                      className="w-full px-3.5 py-2 text-xs bg-paper/10 border border-paper/20 rounded-xl text-paper placeholder:text-paper/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleReject(selectedKyc.id)}
                      className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold border border-red-500/30 transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApprove(selectedKyc.id)}
                      className="px-5 py-2.5 rounded-xl bg-moss text-paper font-display font-bold text-xs hover:bg-moss-hover shadow transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Verified Badge</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-data text-marigold">
                    Status: {selectedKyc.status} {selectedKyc.verifiedAt ? `on ${selectedKyc.verifiedAt}` : ''}
                  </span>
                  <button
                    onClick={() => setSelectedKyc(null)}
                    className="px-4 py-2 rounded-xl bg-paper/15 text-xs font-bold text-paper"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
