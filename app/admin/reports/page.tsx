'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  ShieldAlert,
  Clock,
  UserX,
  FileCheck,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    }
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status, resolutionNotes }: { id: string, status: string, resolutionNotes?: string }) => {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, resolutionNotes })
      });
      if (!res.ok) throw new Error('Failed to update report');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      showToast(`Ticket marked as Resolved.`);
      setSelectedReport(null);
      setResolutionNotes('');
    }
  });

  const handleResolveTicket = (id: string, action: string) => {
    updateReportMutation.mutate({ id, status: 'RESOLVED', resolutionNotes: resolutionNotes || action });
  };

  const filteredReports = reports.filter((r: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        (r.reporter?.name && r.reporter.name.toLowerCase().includes(q)) ||
        r.reportedId.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
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
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Dispute Resolution Desk</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Platform Reports & Incidents
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Investigate damaged items, overdue rentals, deposit deduction claims, and user violations.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-paper/10 p-3 rounded-2xl border border-paper/15 font-data text-xs">
          <div>
            <span className="text-paper/50 block text-[10px]">OPEN TICKETS</span>
            <span className="text-red-400 font-bold text-base">
              {reports.filter((r: any) => r.status !== 'Resolved').length} Active
            </span>
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
          placeholder="Search ticket number, reporter, or reported user..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-paper/10 border border-paper/15 rounded-2xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold"
        />
      </div>

      {/* Tickets List */}
      <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-paper/10 text-[10px] uppercase font-bold text-paper/50">
              <th className="px-6 py-4">Reason / ID</th>
              <th className="px-6 py-4">Reporter</th>
              <th className="px-6 py-4">Reported ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report: any) => (
              <tr key={report.id} className="hover:bg-paper/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-paper">{report.reason}</div>
                  <div className="text-[10px] text-paper/50">ID: {report.id}</div>
                </td>
                <td className="px-6 py-4 font-medium">
                  <div className="text-paper">{report.reporter?.name || 'N/A'}</div>
                  <div className="text-paper/50 text-[10px]">{report.reporter?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 font-data">
                  <div className="text-marigold font-bold text-sm">{report.reportedId}</div>
                </td>
                <td className="px-6 py-4 font-data">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      report.status === 'RESOLVED'
                        ? 'bg-moss/20 text-moss'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-data text-[11px] text-paper/60">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {report.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 rounded-xl bg-paper/15 hover:bg-marigold hover:text-ink text-[10px] font-bold transition-colors"
                    >
                      Take Action
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Investigation Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182326] border border-paper/20 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-paper/10 pb-4">
              <div>
                <span className="text-xs font-data text-marigold font-bold">TICKET RESOLUTION</span>
                <h2 className="font-display font-bold text-xl text-paper mt-0.5">Resolve Ticket</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-paper/50 hover:text-paper">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-paper/5 border border-paper/10 text-xs space-y-2">
              <p className="text-paper/80">{selectedReport.description}</p>
              <div className="pt-2 border-t border-paper/10 flex items-center justify-between text-paper/60 font-data">
                <span>Reporter: {selectedReport.reporter?.name || 'N/A'}</span>
                <span>Target: {selectedReport.reportedId}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-data uppercase text-paper/80 font-bold">
                Resolution Findings & Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter investigation summary, deposit deduction decision, or user warning details..."
                className="w-full p-3 text-xs bg-paper/10 border border-paper/20 rounded-xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleResolveTicket(selectedReport.id, 'Deduct Deposit & Compensate Owner')}
                className="px-3.5 py-2 rounded-xl bg-marigold text-ink font-display font-bold text-xs hover:bg-marigold-hover shadow"
              >
                Deduct Security Deposit
              </button>

              <button
                onClick={() => handleResolveTicket(selectedReport.id, 'Issue Account Warning')}
                className="px-3.5 py-2 rounded-xl bg-paper/20 text-paper font-semibold text-xs hover:bg-paper/30"
              >
                Issue Warning
              </button>

              <button
                onClick={() => handleResolveTicket(selectedReport.id, 'Dismissed as Insufficient Proof')}
                className="px-3.5 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30"
              >
                Dismiss Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
