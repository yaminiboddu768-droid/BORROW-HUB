import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PendingPartnerPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <Card variant="default" className="p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-ink">Waiting for Approval</h1>
        <p className="text-slate text-sm">
          Your Business Partner application is currently under review by our admin team. 
          We will notify you once it has been approved.
        </p>
        <div className="pt-6">
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
