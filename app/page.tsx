'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Store,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';

export default function LandingPage() {
  const headlineOptions = [
    'Borrow what you need. Share what you own.',
    'Why buy when your neighbour already has it?',
    'The smart, local marketplace for household items.',
  ];

  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState(0);

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-marigold/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-moss/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-marigold/20 border border-marigold/40 text-ink text-xs font-semibold font-data shadow-sm">
              <Sparkles className="w-4 h-4 text-marigold fill-marigold" />
              <span>Hyperlocal Sharing & Delivery Ecosystem</span>
            </div>

            {/* Headline Switcher for Pitching */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-ink tracking-tight leading-[1.1]">
                {headlineOptions[selectedHeadlineIndex]}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate font-data">
                <span className="font-medium text-ink">Pitch option:</span>
                {headlineOptions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedHeadlineIndex(idx)}
                    className={`px-2 py-0.5 rounded ${
                      selectedHeadlineIndex === idx
                        ? 'bg-ink text-marigold font-bold'
                        : 'bg-ink/10 text-slate hover:bg-ink/20'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-lg sm:text-xl text-slate max-w-2xl leading-relaxed">
              Connect with neighbours within 5km to borrow tools, cookware, and gear — or rent verified items from online partner stores with hassle-free delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/browse">
                <Button variant="primary" size="lg" className="shadow-md">
                  <MapPin className="w-5 h-5" />
                  <span>Browse nearby</span>
                </Button>
              </Link>
              <Link href="/list">
                <Button variant="accent" size="lg" className="shadow-md">
                  <span>List your item</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-ink/10 grid grid-cols-3 gap-6">
              <div>
                <p className="font-display font-bold text-2xl text-ink">95%</p>
                <p className="text-xs text-slate">Cheaper than buying new</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-moss">0.4 km</p>
                <p className="text-xs text-slate">Average neighbour distance</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-marigold">4.9 ★</p>
                <p className="text-xs text-slate">Community trust rating</p>
              </div>
            </div>
          </div>

          {/* Custom Interactive Illustration: Radar & Live Micro Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-ink text-paper p-6 rounded-3xl border-2 border-marigold/40 shadow-2xl space-y-6 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-paper/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-display font-semibold text-paper text-sm">Live Radar Activity</span>
                </div>
                <Badge variant="marigold">0.5 km radius</Badge>
              </div>

              {/* Concentric Radar Rings Visual */}
              <div className="relative w-full h-52 bg-paper/5 rounded-2xl flex items-center justify-center overflow-hidden border border-paper/10">
                <div className="absolute w-44 h-44 rounded-full border border-marigold/30 animate-ping opacity-20" />
                <div className="absolute w-36 h-36 rounded-full border border-paper/20" />
                <div className="absolute w-24 h-24 rounded-full border border-paper/30" />
                <div className="absolute w-12 h-12 rounded-full border border-marigold/50 bg-marigold/10" />

                {/* Radar Center Dot */}
                <div className="w-4 h-4 rounded-full bg-marigold shadow-lg shadow-marigold/50 z-10 flex items-center justify-center text-[9px] font-bold text-ink">
                  You
                </div>

                {/* Surrounding Nearby Items */}
                <div className="absolute top-6 left-12 bg-moss text-paper text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
                  <span>🔨 Drill (0.4 km)</span>
                </div>
                <div className="absolute bottom-8 right-10 bg-marigold text-ink font-bold text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
                  <span>🍲 Dutch Oven (0.7 km)</span>
                </div>
                <div className="absolute top-10 right-14 bg-clay text-paper text-[10px] px-2 py-1 rounded-full shadow flex items-center gap-1">
                  <span>🎥 Projector (1.2 km)</span>
                </div>
              </div>

              {/* Sample Borrow Card Preview */}
              <div className="bg-paper text-ink p-4 rounded-xl shadow-inner flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">DeWalt Power Drill</span>
                    <Badge variant="moss" size="sm">0.4 km</Badge>
                  </div>
                  <p className="text-xs text-slate mt-0.5">Lender: Sarah M. (4.9 ★)</p>
                </div>
                <div className="text-right">
                  <p className="font-data font-bold text-moss text-base">$8/day</p>
                  <Link href="/browse">
                    <span className="text-[11px] font-medium text-marigold hover:underline">
                      Request →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP HOW IT WORKS SECTION */}
      <section className="bg-white/60 backdrop-blur-sm py-16 border-y border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="marigold" className="mb-3">Simple 3-Step Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-ink">
              How Borrow Hub Works
            </h2>
            <p className="text-slate mt-2">
              No endless buying, no cluttered storage. Get things done in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card variant="interactive" className="relative overflow-hidden group">
              <div className="absolute -top-4 -right-2 text-7xl font-display font-black text-ink/5 group-hover:text-moss/10 transition-colors">
                01
              </div>
              <div className="w-12 h-12 rounded-2xl bg-moss/15 text-moss flex items-center justify-center font-display font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                Find something nearby
              </h3>
              <p className="text-slate text-sm leading-relaxed">
                Filter by distance radius (1–5 km) or search categories to discover tools, outdoor gear, and kitchen appliances available in your neighborhood.
              </p>
            </Card>

            {/* Step 2 */}
            <Card variant="interactive" className="relative overflow-hidden group">
              <div className="absolute -top-4 -right-2 text-7xl font-display font-black text-ink/5 group-hover:text-marigold/10 transition-colors">
                02
              </div>
              <div className="w-12 h-12 rounded-2xl bg-marigold/20 text-ink flex items-center justify-center font-display font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                Request to borrow
              </h3>
              <p className="text-slate text-sm leading-relaxed">
                Send a quick borrowing request directly to your neighbour or place a verified store rental order. Confirm dates with instant status tracking.
              </p>
            </Card>

            {/* Step 3 */}
            <Card variant="interactive" className="relative overflow-hidden group">
              <div className="absolute -top-4 -right-2 text-7xl font-display font-black text-ink/5 group-hover:text-clay/10 transition-colors">
                03
              </div>
              <div className="w-12 h-12 rounded-2xl bg-clay/15 text-clay flex items-center justify-center font-display font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                Return when done
              </h3>
              <p className="text-slate text-sm leading-relaxed">
                Pick up the item locally, complete your project, and return it safely. Mark status as complete and build your community trust score.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* DUAL MARKETPLACE PATHS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="ink" className="mb-3">Two Flexible Paths</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            Neighbours or Online Partners — You Choose
          </h2>
          <p className="text-slate mt-2">
            Whether you need a quick drill from next door or specialized commercial gear delivered, Borrow Hub handles both seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Path 1: From Neighbours (Moss Accent) */}
          <div className="bg-gradient-to-br from-white to-moss/10 p-8 rounded-3xl border-2 border-moss/30 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-moss font-display font-bold text-xl">
                  <Users className="w-6 h-6" />
                  <span>From Neighbours</span>
                </div>
                <Badge variant="moss">Moss Accent</Badge>
              </div>
              <p className="text-slate text-sm leading-relaxed">
                Hyperlocal sharing with people living on your street or within a 5-minute walk. Ideal for occasional DIY tools, baking dishes, and outdoor games.
              </p>

              <ul className="space-y-2 text-sm text-ink font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-moss" />
                  <span>Pay by the day ($4 – $18 avg)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-moss" />
                  <span>Instant local pickup within walking distance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-moss" />
                  <span>Strengthen neighborhood connections</span>
                </li>
              </ul>
            </div>

            <Link href="/browse">
              <Button variant="primary" className="w-full justify-between">
                <span>Explore Neighbourhood Items</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Path 2: From Online Partners (Clay Accent) */}
          <div className="bg-gradient-to-br from-white to-clay/10 p-8 rounded-3xl border-2 border-clay/30 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-clay font-display font-bold text-xl">
                  <Store className="w-6 h-6" />
                  <span>From Online Partners</span>
                </div>
                <Badge variant="clay">Clay Accent</Badge>
              </div>
              <p className="text-slate text-sm leading-relaxed">
                Nothing nearby? Rent professional-grade equipment, cinema gear, and party appliances directly from verified rental partners with doorstep delivery.
              </p>

              <ul className="space-y-2 text-sm text-ink font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-clay" />
                  <span>Weekly rental packages with insured shipping</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-clay" />
                  <span>Next-day doorstep dropoff & return bags</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-clay" />
                  <span>100% equipment guarantee & sanitation</span>
                </li>
              </ul>
            </div>

            <Link href="/online">
              <Button variant="clay" className="w-full justify-between">
                <span>Explore Online Partner Store</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CLOSING CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink text-paper p-10 sm:p-14 rounded-3xl border-4 border-marigold shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-marigold/10 rounded-full blur-2xl pointer-events-none" />

          <Badge variant="marigold" className="mx-auto">
            Ready to get started?
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-bold font-display text-paper max-w-3xl mx-auto leading-tight">
            Stop buying things you only use once. Join the Borrow Hub community today.
          </h2>

          <p className="text-paper/80 text-base sm:text-lg max-w-2xl mx-auto">
            Browse hundreds of items available right now in your neighborhood or list your unused gear to earn extra income.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/browse">
              <Button variant="accent" size="lg" className="font-bold">
                Browse Neighbourhood Items
              </Button>
            </Link>
            <Link href="/list">
              <Button variant="outline" size="lg" className="border-paper text-paper hover:bg-paper hover:text-ink">
                List an Item Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
