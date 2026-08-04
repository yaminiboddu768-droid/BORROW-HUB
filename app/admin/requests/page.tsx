'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_ADMIN_REQUESTS, AdminRequestOrder } from '@/lib/adminMockData';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequestOrder[]>(INITIAL_ADMIN_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const advanceOrderStatus = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        const nextStatus =
          req.orderStatus === 'Requested'
            ? 'Approved'
            : req.orderStatus === 'Approved'
            ? 'Active'
            : req.orderStatus === 'Active'
            ? 'Returned'
            : req.orderStatus;

        const nextDeposit = nextStatus === 'Returned' ? 'Refunded' : req.depositStatus;

        showToast(`Order ${req.id} status updated to ${nextStatus}.`);
        return { ...req, orderStatus: nextStatus as any, depositStatus: nextDeposit as any };
      })
    );
  };

  const filteredRequests = requests.filter((r) => {
    if (typeFilter !== 'All' && r.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.itemTitle.toLowerCase().includes(q) ||
        r.borrowerName.toLowerCase().includes(q) ||
        r.lenderOrStore.toLowerCase().includes(q)
      );
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
            <ArrowRightLeft className="w-4 h-4" />
            <span>Order & Rental Monitor</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Borrow & Rental Requests
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Monitor real-time fulfillment pipelines, delivery tracking, and deposit escrow holdings.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-paper/10 p-3 rounded-2xl border border-paper/15 font-data text-xs">
          <div>
            <span className="text-paper/50 block text-[10px]">TOTAL ESCROW HELD</span>
            <span className="text-marigold font-bold text-base">₹25,000</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, item title, borrower name..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-paper/10 border border-paper/15 rounded-2xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs bg-ink border border-paper/15 rounded-2xl text-paper font-data focus:outline-none focus:border-marigold"
        >
          <option value="All">All Types</option>
          <option value="Neighbourhood Borrow">Neighbourhood Borrow</option>
          <option value="Partner Rental">Partner Rental</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper/5 text-paper/60 uppercase font-data border-b border-paper/10">
              <tr>
                <th className="px-6 py-4">Order ID & Item</th>
                <th className="px-6 py-4">Parties Involved</th>
                <th className="px-6 py-4">Rental Period</th>
                <th className="px-6 py-4">Financials & Deposit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/10 text-paper">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-paper/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-marigold font-bold font-data text-xs block">{req.id}</span>
                    <span className="font-bold text-sm text-paper block mt-0.5">{req.itemTitle}</span>
                    <span className="text-[10px] font-data uppercase text-paper/50">{req.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>Borrower: <span className="font-bold text-paper">{req.borrowerName}</span></div>
                    <div className="text-paper/60">Provider: {req.lenderOrStore}</div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <div>{req.startDate} → {req.endDate}</div>
                    <div className="text-paper/50 text-[10px]">Created: {req.createdAt}</div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <div className="text-marigold font-bold">Total: ₹{req.totalAmount}</div>
                    <div className="text-paper/60 text-[11px]">Deposit: ₹{req.depositAmount} ({req.depositStatus})</div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                        req.orderStatus === 'Returned'
                          ? 'bg-moss/20 text-moss border border-moss/30'
                          : req.orderStatus === 'Active'
                          ? 'bg-marigold/20 text-marigold border border-marigold/30'
                          : 'bg-paper/15 text-paper border border-paper/20'
                      }`}
                    >
                      {req.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.orderStatus !== 'Returned' ? (
                      <button
                        onClick={() => advanceOrderStatus(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-marigold text-ink font-display font-bold hover:bg-marigold-hover transition-colors shadow"
                      >
                        Advance Pipeline →
                      </button>
                    ) : (
                      <span className="text-moss font-data text-xs font-bold">Fulfilled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
