import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { DollarSign, TrendingUp, Package, Users, Star, Activity } from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string;

  if (!userId) {
    redirect('/login');
  }

  // 1. Fetch raw data for aggregations
  const allRequests = await prisma.borrowRequest.findMany({
    where: { item: { ownerId: userId } },
    include: { item: true, borrower: true },
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today);
  thisWeek.setDate(today.getDate() - today.getDay());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 2. Earnings Aggregation
  let earningsToday = 0;
  let earningsWeek = 0;
  let earningsMonth = 0;
  let earningsLifetime = 0;

  allRequests.forEach(req => {
    if (req.status === 'completed') {
      const amount = (req.estimatedCost || 0) + (req.penaltyAmount || 0);
      earningsLifetime += amount;
      
      const reqDate = new Date(req.createdAt);
      if (reqDate >= today) earningsToday += amount;
      if (reqDate >= thisWeek) earningsWeek += amount;
      if (reqDate >= thisMonth) earningsMonth += amount;
    }
  });

  // 3. Rentals Aggregation
  const totalRentals = allRequests.length;
  const activeRentals = allRequests.filter(r => r.status === 'active').length;
  const completedRentals = allRequests.filter(r => r.status === 'completed').length;
  const cancelledRentals = allRequests.filter(r => r.status === 'cancelled').length;

  // 4. Products Aggregation (Most vs Least Rented)
  const productStats: Record<string, { name: string, count: number, earnings: number }> = {};
  allRequests.forEach(req => {
    if (!productStats[req.itemId]) {
      productStats[req.itemId] = { name: req.item.name, count: 0, earnings: 0 };
    }
    productStats[req.itemId].count += 1;
    if (req.status === 'completed') {
      productStats[req.itemId].earnings += (req.estimatedCost || 0) + (req.penaltyAmount || 0);
    }
  });

  const sortedProducts = Object.values(productStats).sort((a, b) => b.count - a.count);
  const topProducts = sortedProducts.slice(0, 3);
  const leastRented = sortedProducts.slice(-3).reverse();

  // 5. Customers Aggregation
  const customerStats: Record<string, { name: string, count: number }> = {};
  allRequests.forEach(req => {
    if (!customerStats[req.borrowerId]) {
      customerStats[req.borrowerId] = { name: req.borrower.name, count: 0 };
    }
    customerStats[req.borrowerId].count += 1;
  });

  const totalCustomers = Object.keys(customerStats).length;
  const repeatCustomers = Object.values(customerStats).filter(c => c.count > 1).length;
  const topCustomer = Object.values(customerStats).sort((a, b) => b.count - a.count)[0];

  // 6. Business Health Score (0-100)
  // Simple algorithm: Base 100 - (cancellation rate * 50) + (if rating > 4 then +10, if < 3 then -20)
  const userRecord = await prisma.user.findUnique({ where: { id: userId } });
  const avgRating = userRecord?.averageRating || 5.0;
  
  let healthScore = 100;
  if (totalRentals > 0) {
    const cancelRate = cancelledRentals / totalRentals;
    healthScore -= (cancelRate * 50);
  }
  if (avgRating > 4.5) healthScore = Math.min(100, healthScore + 5);
  if (avgRating < 3.5) healthScore -= 20;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink">Analytics Dashboard</h1>
        <p className="text-slate text-sm">Deep dive into your business performance.</p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate mb-1">Lifetime Earnings</p>
            <p className="text-2xl font-bold text-ink">₹{earningsLifetime.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>
        
        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate mb-1">Total Rentals</p>
            <p className="text-2xl font-bold text-ink">{totalRentals}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-ink">{totalCustomers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="default" className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate mb-1">Health Score</p>
            <p className="text-2xl font-bold text-ink">{Math.round(healthScore)}/100</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-marigold/20 text-marigold flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Breakdown */}
        <Card variant="default" className="p-6">
          <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Earnings Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate">Today</span>
              <span className="font-bold text-ink text-lg">₹{earningsToday.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate">This Week</span>
              <span className="font-bold text-ink text-lg">₹{earningsWeek.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate">This Month</span>
              <span className="font-bold text-ink text-lg">₹{earningsMonth.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Rentals Status */}
        <Card variant="default" className="p-6">
          <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Rental Lifecycle
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate">Active Rentals</span>
                <span className="font-bold text-ink">{activeRentals}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalRentals > 0 ? (activeRentals / totalRentals) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate">Completed</span>
                <span className="font-bold text-ink">{completedRentals}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalRentals > 0 ? (completedRentals / totalRentals) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate">Cancelled</span>
                <span className="font-bold text-ink">{cancelledRentals}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalRentals > 0 ? (cancelledRentals / totalRentals) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card variant="default" className="p-6">
          <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Top Performing Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-ink text-sm">{p.name}</p>
                    <p className="text-xs text-slate">{p.count} rentals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ink text-sm">₹{p.earnings.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate text-center py-4">No product data available yet.</p>
          )}
        </Card>

        {/* Customer Insights */}
        <Card variant="default" className="p-6">
          <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Customer Insights
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-ink mb-1">{repeatCustomers}</p>
              <p className="text-xs font-medium text-slate uppercase tracking-wider">Repeat<br/>Customers</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-ink mb-1 truncate px-2">{topCustomer?.name || 'N/A'}</p>
              <p className="text-xs font-medium text-slate uppercase tracking-wider">Top<br/>Customer</p>
            </div>
            <div className="col-span-2 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate uppercase tracking-wider">Average Rating</p>
                <div className="flex items-center mt-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-ink ml-1 text-lg">{avgRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-right text-sm font-medium text-slate">
                <span className="text-green-600">95% Positive</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
