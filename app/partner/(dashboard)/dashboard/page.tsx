import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

  // Aggregate earnings from completed rentals (mocking the cost aggregation for now as estimatedCost is what we have)
  const completedRequests = await prisma.borrowRequest.findMany({
    where: { item: { ownerId: userId }, status: 'completed' },
    select: { estimatedCost: true, penaltyAmount: true },
  });

  const totalEarnings = completedRequests.reduce((sum, req) => {
    return sum + (req.estimatedCost || 0) + (req.penaltyAmount || 0);
  }, 0);

  // Fetch recent activity (combining newest products and newest requests for demonstration)
  const recentRequests = await prisma.borrowRequest.findMany({
    where: { item: { ownerId: userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { item: true, borrower: true },
  });

  const STATS = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Requests', value: pendingRequests, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Active Rentals', value: activeRentals, icon: Truck, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Average Rating', value: user?.averageRating?.toFixed(1) || 'N/A', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Dashboard Overview</h1>
          <p className="text-slate text-sm">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/partner/inventory">
            <Button variant="accent">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/partner/requests">
          <Button variant="outline" size="sm">View Requests</Button>
        </Link>
        <Link href="/partner/analytics">
          <Button variant="outline" size="sm">View Analytics</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map((stat, idx) => (
          <Card key={idx} variant="default" className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-ink mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-slate">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card variant="default" className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-slate" />
          <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
        </div>
        
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-slate text-sm">
            No recent activity to show yet.
          </div>
        ) : (
          <div className="space-y-4">
            {recentRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-ink">
                    <span className="font-bold">{req.borrower.name}</span> requested <span className="font-bold">{req.item.name}</span>
                  </p>
                  <p className="text-xs text-slate mt-1">
                    Status: <span className="uppercase font-bold">{req.status}</span> • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">₹{req.estimatedCost}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
