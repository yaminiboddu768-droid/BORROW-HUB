'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-ink text-paper/80 border-t border-ink/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Borrow Hub Logo" className="w-6 h-6 object-contain rounded-lg bg-white" />
            <span className="font-display font-bold text-paper text-lg">Borrow Hub</span>
            <span className="text-xs text-paper/50 ml-2 font-data">
              Borrow Hub — sample prototype
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-paper/70 font-medium">
            <Link href="/browse" className="hover:text-marigold transition-colors">
              Neighbourhood Borrowing
            </Link>
            <Link href="/online" className="hover:text-marigold transition-colors">
              Online Partner Rentals
            </Link>
            <Link href="/style-guide" className="hover:text-marigold transition-colors">
              Design Tokens Guide
            </Link>
          </div>

          <p className="text-xs font-data text-paper/50">
            Built for community sustainability · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
