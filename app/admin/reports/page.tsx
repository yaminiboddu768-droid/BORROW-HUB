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
import { INITIAL_ADMIN_REPORTS, AdminReportDispute } from '@/lib/adminMockData';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReportDispute[]>(INITIAL_ADMIN_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<AdminReportDispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveTicket = (id: string, action: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Resolved',
              resolutionNotes: resolutionNotes || action,
            }
          : r
      )
    );
    showToast(`Ticket ${selectedReport?.ticketNumber} marked as Resolved (${action}).`);
    setSelectedReport(null);
    setResolutionNotes('');
  };

  const filteredReports = reports.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.ticketNumber.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        r.reportedTarget.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
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
              {reports.filter((r) => r.status !== 'Resolved').length} Active
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
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-marigold/40 transition-all shadow-xl"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-data text-marigold">{report.ticketNumber}</span>
                <span
                  className={`text-[10px] uppercase font-bold font-data px-2 py-0.5 rounded ${
                    report.severity === 'Critical'
                      ? 'bg-red-500 text-white'
                      : report.severity === 'High'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-marigold/20 text-marigold border border-marigold/30'
                  }`}
                >
                  {report.severity} Severity
                </span>
                <span
                  className={`text-[10px] font-data px-2.5 py-0.5 rounded-full font-bold ${
                    report.status === 'Resolved'
                      ? 'bg-moss/20 text-moss border border-moss/30'
                      : 'bg-paper/15 text-paper border border-paper/20'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <h3 className="font-display font-bold text-base text-paper">{report.type}</h3>
              <p className="text-xs text-paper/80 leading-relaxed max-w-3xl">{report.description}</p>

              <div className="flex items-center gap-4 text-xs font-data text-paper/60 pt-1">
                <span>Reporter: <strong className="text-paper">{report.reporterName}</strong></span>
                <span>• Target: <strong className="text-paper">{report.reportedTarget}</strong></span>
                <span>• Logged: {report.createdAt}</span>
              </div>

              {report.resolutionNotes && (
                <div className="mt-2 p-2.5 rounded-xl bg-moss/10 border border-moss/30 text-xs text-moss font-data">
                  <strong>Resolution:</strong> {report.resolutionNotes}
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setSelectedReport(report)}
                className="px-4 py-2 rounded-xl bg-marigold text-ink font-display font-bold text-xs hover:bg-marigold-hover shadow transition-colors"
              >
                Investigate Ticket
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Investigation Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182326] border border-paper/20 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-paper/10 pb-4">
              <div>
                <span className="text-xs font-data text-marigold font-bold">{selectedReport.ticketNumber}</span>
                <h2 className="font-display font-bold text-xl text-paper mt-0.5">{selectedReport.type}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-paper/50 hover:text-paper">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-paper/5 border border-paper/10 text-xs space-y-2">
              <p className="text-paper/80">{selectedReport.description}</p>
              <div className="pt-2 border-t border-paper/10 flex items-center justify-between text-paper/60 font-data">
                <span>Reporter: {selectedReport.reporterName}</span>
                <span>Target: {selectedReport.reportedTarget}</span>
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
