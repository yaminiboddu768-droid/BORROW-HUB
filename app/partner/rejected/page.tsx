import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RejectedPartnerPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <Card variant="default" className="p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-ink">Application Rejected</h1>
        <p className="text-slate text-sm">
          Unfortunately, your Business Partner application has been rejected by our admin team.
          If you believe this is a mistake, please contact support.
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
