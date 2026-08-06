'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  PieChart,
  Globe,
  Users,
  Package,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { INITIAL_ADMIN_ANALYTICS } from '@/lib/adminMockData';

export default function AdminAnalyticsPage() {
  const { monthlyGMV, categoryDistribution, topLocations } = INITIAL_ADMIN_ANALYTICS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-marigold font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Platform Financial & Usage Analytics
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Analyze Gross Merchandise Value (GMV), platform fee monetization, category velocity, and city penetration.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-paper/10 p-3 rounded-2xl border border-paper/15 font-data text-xs">
          <span className="text-paper/60">Monetization Engine:</span>
          <span className="text-moss font-bold text-base">8.5% Base Fee</span>
        </div>
      </div>

      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 border-l-4 border-marigold">
          <span className="text-xs font-data text-paper/60 uppercase">TOTAL YTD GMV</span>
          <p className="font-display font-bold text-3xl text-marigold mt-2">₹24,10,000</p>
          <p className="text-xs text-paper/60 font-data mt-1">+22.4% vs previous quarter</p>
        </div>

        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 border-l-4 border-moss">
          <span className="text-xs font-data text-paper/60 uppercase">PLATFORM FEE REVENUE</span>
          <p className="font-display font-bold text-3xl text-moss mt-2">₹2,04,850</p>
          <p className="text-xs text-paper/60 font-data mt-1">Net operational margin</p>
        </div>

        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 border-l-4 border-clay">
          <span className="text-xs font-data text-paper/60 uppercase">AVG BORROW DURATION</span>
          <p className="font-display font-bold text-3xl text-paper mt-2">3.4 Days</p>
          <p className="text-xs text-paper/60 font-data mt-1">Repeat borrow rate: 64%</p>
        </div>
      </div>

      {/* Analytics Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Panel */}
        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-marigold" />
              <h2 className="font-display font-bold text-lg text-paper">Category Demand Breakdown</h2>
            </div>
            <span className="text-xs font-data text-paper/50">Volume Distribution</span>
          </div>

          <div className="space-y-4">
            {INITIAL_ADMIN_ANALYTICS.categoryDistribution.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-data">
                  <span className="text-paper font-bold">{cat.category}</span>
                  <span className="text-marigold font-bold">{cat.count} listings ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-paper/10 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-marigold h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional City Demand */}
        <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-moss" />
              <h2 className="font-display font-bold text-lg text-paper">Regional City Metrics</h2>
            </div>
            <span className="text-xs font-data text-paper/50">Geographic Penetration</span>
          </div>

          <div className="divide-y divide-paper/10">
            {INITIAL_ADMIN_ANALYTICS.topLocations.map((loc: any, idx: number) => (
              <div key={idx} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-paper">{loc.city}</h3>
                  <p className="text-xs text-paper/60 font-data">{loc.activeUsers} Active Borrowers/Lenders</p>
                </div>
                <div className="text-right font-data">
                  <span className="text-marigold font-bold text-sm block">{loc.totalBorrows} Borrows</span>
                  <span className="text-moss text-xs">High Velocity</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
