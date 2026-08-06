'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  UserCheck,
  UserX,
  Star,
  MapPin,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast(`User account "${data.name}" status set to ${data.status}.`);
    }
  });

  const toggleUserStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'APPROVED' ? 'BLOCKED' : 'APPROVED';
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredUsers = users.filter((u: any) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.locationText && u.locationText.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink border border-marigold/50 text-paper p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-moss shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-marigold font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>User Account Directory</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Platform Users Management
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Monitor trust scores, borrow history, account status, and identity verifications.
          </p>
        </div>

        <div className="flex items-center gap-3 font-data text-xs bg-paper/10 p-3 rounded-2xl border border-paper/15">
          <div className="text-center">
            <span className="block text-marigold font-bold text-base">{users.length}</span>
            <span className="text-paper/60 text-[10px] uppercase">Registered</span>
          </div>
          <div className="w-px h-6 bg-paper/20" />
          <div className="text-center">
            <span className="block text-moss font-bold text-base">{users.filter((u: any) => u.status === 'APPROVED').length}</span>
            <span className="text-paper/60 text-[10px] uppercase">Active</span>
          </div>
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
            placeholder="Search user by name, email address, location..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-paper/10 border border-paper/15 rounded-2xl text-paper placeholder:text-paper/40 focus:outline-none focus:border-marigold"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs bg-ink border border-paper/15 rounded-2xl text-paper font-data focus:outline-none focus:border-marigold"
        >
          <option value="All">All Roles</option>
          <option value="Borrower">Borrowers</option>
          <option value="Lender">Lenders</option>
          <option value="Business Partner">Business Partners</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs bg-ink border border-paper/15 rounded-2xl text-paper font-data focus:outline-none focus:border-marigold"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Flagged">Flagged</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper/5 text-paper/60 uppercase font-data border-b border-paper/10">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role & Location</th>
                <th className="px-6 py-4">Trust Score</th>
                <th className="px-6 py-4">Activity (Borrows / Lends)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/10 text-paper">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-paper/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-marigold/20 text-marigold border border-marigold/40 flex items-center justify-center font-bold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-paper flex items-center gap-1.5">
                          {u.name}
                          {u.idVerified && (
                            <span title="Govt ID Verified">
                              <CheckCircle2 className="w-3.5 h-3.5 text-moss" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-paper/60 font-data">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-paper block">{u.role}</span>
                    <span className="text-paper/50 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-marigold" />
                      {u.locationText || 'No location'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <div className="flex items-center gap-1 text-marigold font-bold">
                      <Star className="w-3.5 h-3.5 fill-marigold" />
                      <span>{u.trustScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <div>Borrows: <span className="text-marigold font-bold">{u.totalBorrows}</span></div>
                    <div>Lends: <span className="text-moss font-bold">{u.totalLends}</span></div>
                  </td>
                  <td className="px-6 py-4 font-data">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                        u.status === 'APPROVED'
                          ? 'bg-moss/20 text-moss border border-moss/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {u.status === 'APPROVED' ? 'Active' : u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id, u.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${
                        u.status === 'APPROVED'
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                          : 'bg-moss text-paper hover:bg-moss-hover'
                      }`}
                    >
                      {u.status === 'APPROVED' ? 'Suspend Account' : 'Reinstate Account'}
                    </button>
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
