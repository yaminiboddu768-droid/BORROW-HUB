import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Package, ClipboardList, Truck, DollarSign, Star, Plus, Activity } from 'lucide-react';

export default async function PartnerDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string;

  if (!userId) {
    redirect('/login');
  }

  // Fetch real data for overview cards
  const [totalProducts, pendingRequests, activeRentals, user] = await Promise.all([
    prisma.item.count({ where: { ownerId: userId } }),
    prisma.borrowRequest.count({ where: { item: { ownerId: userId }, status: 'pending' } }),
    prisma.borrowRequest.count({ where: { item: { ownerId: userId }, status: 'active' } }),
    prisma.user.findUnique({ where: { id: userId }, select: { averageRating: true } }),
  ]);

  // Aggregate earnings from completed rentals
  const completedRequests = await prisma.borrowRequest.findMany({
    where: { item: { ownerId: userId }, status: 'completed' },
    select: { estimatedCost: true, penaltyAmount: true },
  });

  const totalEarnings = completedRequests.reduce((sum, req) => {
    return sum + (req.estimatedCost || 0) + (req.penaltyAmount || 0);
  }, 0);

  // Fetch recent activity
  const recentRequests = await prisma.borrowRequest.findMany({
    where: { item: { ownerId: userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { item: true, borrower: true },
  });

  const STATS = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Pending Requests', value: pendingRequests, icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Active Rentals', value: activeRentals, icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Average Rating', value: user?.averageRating ? user.averageRating.toFixed(1) : '4.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>

          {/* Quick Action Pill Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Link
              href="/partner/requests"
              className="inline-flex items-center justify-center px-4 py-1.5 border border-slate-300 bg-white text-slate-700 font-semibold text-xs rounded-full hover:bg-slate-50 transition-colors shadow-2xs"
            >
              View Requests
            </Link>
            <Link
              href="/partner/analytics"
              className="inline-flex items-center justify-center px-4 py-1.5 border border-slate-300 bg-white text-slate-700 font-semibold text-xs rounded-full hover:bg-slate-50 transition-colors shadow-2xs"
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Top Right + Add New Item Button */}
        <div>
          <Link
            href="/partner/inventory"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#121721] font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Item</span>
          </Link>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} mb-6`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{stat.value}</p>
                <p className="text-slate-400 text-xs font-semibold">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No recent activity to show yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-slate-100/80 rounded-2xl transition-colors hover:bg-slate-100/60"
              >
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-bold text-slate-900">{req.borrower.name}</span> requested{' '}
                    <span className="font-bold text-slate-900">{req.item.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">
                    Status: <span className="font-bold text-slate-600">{req.status}</span> •{' '}
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">₹{req.estimatedCost}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
