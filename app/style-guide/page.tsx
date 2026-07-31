'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function StyleGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div>
        <h1 className="text-4xl font-bold font-display text-ink mb-2">Borrow Hub Design System & Primitives</h1>
        <p className="text-slate text-lg">
          Tokens, typography, and reusable UI components for Borrow Hub.
        </p>
      </div>

      {/* Color Tokens Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink border-b border-ink/10 pb-2">
          Color Palette Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="bg-ink text-paper p-4 rounded-xl shadow">
            <p className="font-display font-semibold">Ink</p>
            <p className="font-data text-xs text-paper/70">#1B2A2E</p>
            <p className="text-xs mt-2 text-paper/60">Primary Dark</p>
          </div>
          <div className="bg-paper border border-ink/20 text-ink p-4 rounded-xl shadow">
            <p className="font-display font-semibold">Paper</p>
            <p className="font-data text-xs text-slate">#ECEAE0</p>
            <p className="text-xs mt-2 text-slate">Background</p>
          </div>
          <div className="bg-moss text-paper p-4 rounded-xl shadow">
            <p className="font-display font-semibold">Moss</p>
            <p className="font-data text-xs text-paper/80">#4B6B4A</p>
            <p className="text-xs mt-2 text-paper/80">Brand Green</p>
          </div>
          <div className="bg-marigold text-ink p-4 rounded-xl shadow">
            <p className="font-display font-semibold">Marigold</p>
            <p className="font-data text-xs text-ink/80">#E3A72E</p>
            <p className="text-xs mt-2 text-ink/80">Accent / CTA</p>
          </div>
          <div className="bg-clay text-paper p-4 rounded-xl shadow">
            <p className="font-display font-semibold">Clay</p>
            <p className="font-data text-xs text-paper/80">#8B5E3C</p>
            <p className="text-xs mt-2 text-paper/80">Store Accent</p>
          </div>
          <div className="bg-slate text-paper p-4 rounded-xl shadow">
            <p className="font-display font-semibold">Slate</p>
            <p className="font-data text-xs text-paper/80">#5B6B6A</p>
            <p className="text-xs mt-2 text-paper/80">Muted Text</p>
          </div>
        </div>
      </section>

      {/* Typography Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink border-b border-ink/10 pb-2">
          Typography Stack
        </h2>
        <div className="space-y-3 bg-white/70 p-6 rounded-2xl border border-ink/10">
          <div>
            <span className="text-xs font-data text-slate uppercase tracking-wider">Heading Font (Space Grotesk)</span>
            <h1 className="text-3xl font-display font-bold text-ink">The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div>
            <span className="text-xs font-data text-slate uppercase tracking-wider">Body Font (Inter)</span>
            <p className="text-base text-ink">
              Borrow household items from trusted neighbours nearby or order partner rentals delivered straight to your door.
            </p>
          </div>
          <div>
            <span className="text-xs font-data text-slate uppercase tracking-wider">Data Font (IBM Plex Mono)</span>
            <p className="font-data text-sm text-moss font-semibold">
              $12.50 / day · 0.4 km away · 18 times borrowed · Status: [Picked up]
            </p>
          </div>
        </div>
      </section>

      {/* Reusable Component: Button */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink border-b border-ink/10 pb-2">
          1. Button Component
        </h2>
        <div className="flex flex-wrap items-center gap-4 bg-white/70 p-6 rounded-2xl border border-ink/10">
          <Button variant="primary">Primary (Moss)</Button>
          <Button variant="accent">Accent (Marigold)</Button>
          <Button variant="clay">Clay (Store)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading>Loading State</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large CTA</Button>
        </div>
      </section>

      {/* Reusable Component: Badge */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink border-b border-ink/10 pb-2">
          2. Badge Component
        </h2>
        <div className="flex flex-wrap items-center gap-3 bg-white/70 p-6 rounded-2xl border border-ink/10">
          <Badge variant="moss">0.4 km away</Badge>
          <Badge variant="marigold">Requested</Badge>
          <Badge variant="clay">Online Partner</Badge>
          <Badge variant="ink">Tools</Badge>
          <Badge variant="slate">Returned</Badge>
          <Badge variant="outline">Electronics</Badge>
        </div>
      </section>

      {/* Reusable Component: Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink border-b border-ink/10 pb-2">
          3. Card Component
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <Badge variant="moss" className="mb-2">Default Card</Badge>
            <h3 className="font-display text-lg font-bold text-ink">DeWalt Cordless Drill</h3>
            <p className="text-xs text-slate mt-1">18V power drill with battery pack & bits.</p>
            <p className="font-data text-sm font-semibold text-moss mt-3">$8 / day</p>
          </Card>
          <Card variant="interactive">
            <Badge variant="marigold" className="mb-2">Interactive (Hover me)</Badge>
            <h3 className="font-display text-lg font-bold text-ink">Le Creuset Dutch Oven</h3>
            <p className="text-xs text-slate mt-1">Enameled cast iron in Cerise Red.</p>
            <p className="font-data text-sm font-semibold text-marigold mt-3">$6 / day</p>
          </Card>
          <Card variant="dark">
            <Badge variant="marigold" className="mb-2">Dark Card</Badge>
            <h3 className="font-display text-lg font-bold text-paper">Thule 3-Bike Hitch Rack</h3>
            <p className="text-xs text-paper/70 mt-1">Fits 2-inch receiver with locking mechanism.</p>
            <p className="font-data text-sm font-semibold text-marigold mt-3">$10 / day</p>
          </Card>
        </div>
      </section>

      {/* Reusable Component: Input */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink border-b border-ink/10 pb-2">
          4. Input Component
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/70 p-6 rounded-2xl border border-ink/10">
          <Input label="Item Name" placeholder="e.g. Bosch High-Pressure Washer" helperText="Be as descriptive as possible." />
          <Input label="Price per Day ($)" type="number" placeholder="8" />
          <Input label="Email Address" type="email" placeholder="you@example.com" error="Please enter a valid email address" />
          <Input label="Disabled State" value="Unavailable field" disabled />
        </div>
      </section>
    </div>
  );
}
