'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_ADMIN_KYC_REQUESTS,
  INITIAL_ADMIN_REPORTS,
  INITIAL_ADMIN_ANALYTICS,
} from '@/lib/adminMockData';

export default function AdminDashboardPage() {
  const pendingKYC = INITIAL_ADMIN_KYC_REQUESTS.filter((k) => k.status === 'Pending');
  const openReports = INITIAL_ADMIN_REPORTS.filter((r) => r.status !== 'Resolved');

  const stats = [
    {
      title: 'Total Active Users',
      value: '1,482',
      change: '+14% this month',
      isPositive: true,
      icon: Users,
      href: '/admin/users',
      accent: 'border-l-4 border-marigold',
    },
    {
      title: 'Verified Business Partners',
      value: '38',
      change: '+5 pending review',
      isPositive: true,
      icon: Store,
      href: '/admin/business-partners',
      accent: 'border-l-4 border-moss',
    },
    {
      title: 'Active Platform Listings',
      value: '892',
      change: '+68 neighbourhood / +44 partner',
      isPositive: true,
      icon: Package,
      href: '/admin/listings',
      accent: 'border-l-4 border-clay',
    },
    {
      title: 'Total Platform GMV',
      value: '₹5,10,000',
      change: '₹43,350 platform revenue',
      isPositive: true,
      icon: IndianRupee,
      href: '/admin/analytics',
      accent: 'border-l-4 border-marigold',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-data text-marigold font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Admin Control Room</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-paper mt-1">
            Platform Overview & Operations
          </h1>
          <p className="text-xs sm:text-sm text-paper/70 mt-1">
            Real-time monitoring across Borrow Hub user network, partner stores, and transaction escrow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/business-verification"
            className="px-4 py-2.5 rounded-xl bg-marigold text-ink font-display font-bold text-xs hover:bg-marigold-hover transition-colors shadow flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Pending KYC ({pendingKYC.length})</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.href}
              className={`bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-2xl p-5 hover:bg-paper/15 transition-all group ${stat.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-paper/70 font-medium">{stat.title}</span>
                <div className="w-8 h-8 rounded-xl bg-paper/10 flex items-center justify-center text-marigold group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display font-bold text-2xl text-paper mt-3">{stat.value}</p>
              <p className="text-[11px] font-data text-paper/60 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-moss" />
                <span>{stat.change}</span>
              </p>
            </Link>
          );
        })}
      </div>

      {/* Urgent Attention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: KYC Approvals Queue & Analytics Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent KYC Card */}
          <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-marigold" />
                <h2 className="font-display font-bold text-lg text-paper">
                  Pending Business Verification ({pendingKYC.length})
                </h2>
              </div>
              <Link
                href="/admin/business-verification"
                className="text-xs font-bold text-marigold hover:underline flex items-center gap-1"
              >
                <span>View Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-paper/10">
              {pendingKYC.map((kyc) => (
                <div key={kyc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-paper">{kyc.businessName}</span>
                      <span className="text-[10px] font-data px-2 py-0.5 rounded bg-marigold/20 text-marigold border border-marigold/30">
                        {kyc.category}
                      </span>
                    </div>
                    <p className="text-xs text-paper/70 mt-0.5">
                      Owner: {kyc.ownerName} • GSTIN: <span className="font-data">{kyc.gstin}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-data text-paper/50">{kyc.appliedDate}</span>
                    <Link
                      href="/admin/business-verification"
                      className="px-3 py-1.5 rounded-xl bg-paper/15 hover:bg-marigold hover:text-ink text-xs font-semibold transition-colors"
                    >
                      Review Specs
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Performance Chart Simulation */}
          <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-paper">Platform Financial Trajectory</h3>
                <p className="text-xs text-paper/60 font-data">Monthly GMV vs Platform Fee Revenue (₹)</p>
              </div>
              <span className="text-xs font-data px-3 py-1 rounded-xl bg-moss/20 text-moss border border-moss/30 font-bold">
                +18.4% YoY Growth
              </span>
            </div>

            <div className="space-y-4">
              {INITIAL_ADMIN_ANALYTICS.monthlyGMV.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-data">
                    <span className="text-paper/80 font-bold">{item.month}</span>
                    <span className="text-marigold font-bold">GMV: ₹{item.gmv.toLocaleString('en-IN')} (Fee: ₹{item.revenue.toLocaleString('en-IN')})</span>
                  </div>
                  <div className="w-full bg-paper/10 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-marigold h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.gmv / 600000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Open Disputes & System Activity */}
        <div className="space-y-6">
          {/* Active Disputes Panel */}
          <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-paper">Open Disputes ({openReports.length})</h3>
              </div>
              <Link href="/admin/reports" className="text-xs text-marigold font-bold hover:underline">
                All Tickets
              </Link>
            </div>

            <div className="space-y-3">
              {openReports.map((report) => (
                <div key={report.id} className="p-3.5 rounded-2xl bg-paper/5 border border-paper/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 font-data">{report.ticketNumber}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-paper mt-1">{report.type}</p>
                  <p className="text-xs text-paper/70 line-clamp-2">{report.description}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-data text-paper/50">
                    <span>Target: {report.reportedTarget}</span>
                    <Link href="/admin/reports" className="text-marigold hover:underline font-bold">
                      Investigate →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Platform Shortcuts */}
          <div className="bg-paper/10 backdrop-blur-xl border border-paper/15 rounded-3xl p-6 space-y-3">
            <h3 className="font-display font-bold text-sm text-paper mb-2">Admin Shortcuts</h3>
            <Link
              href="/admin/users"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-paper/5 hover:bg-paper/15 text-xs font-medium text-paper transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-marigold" />
                <span>User Account Directory</span>
              </div>
              <ChevronRight className="w-4 h-4 text-paper/40" />
            </Link>

            <Link
              href="/admin/business-partners"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-paper/5 hover:bg-paper/15 text-xs font-medium text-paper transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-marigold" />
                <span>Partner Commission Manager</span>
              </div>
              <ChevronRight className="w-4 h-4 text-paper/40" />
            </Link>

            <Link
              href="/admin/settings"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-paper/5 hover:bg-paper/15 text-xs font-medium text-paper transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-moss" />
                <span>System Security & Policies</span>
              </div>
              <ChevronRight className="w-4 h-4 text-paper/40" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
