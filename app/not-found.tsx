import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-marigold/20 text-ink flex items-center justify-center font-display font-bold text-3xl mx-auto shadow-inner">
        404
      </div>
      <Badge variant="marigold">Page Not Found</Badge>
      <h1 className="text-3xl font-bold font-display text-ink">
        Out of Borrow Hub Radius
      </h1>
      <p className="text-slate text-sm">
        The page or item listing you are looking for has been moved, returned, or doesn't exist.
      </p>

      <div className="pt-4 flex justify-center gap-3">
        <Link href="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
        <Link href="/browse">
          <Button variant="accent">
            <span>Browse Items</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
