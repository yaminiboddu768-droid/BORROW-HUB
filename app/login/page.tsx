'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import { LogIn, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useApp();
  const callbackUrl = searchParams.get('callbackUrl') || '/browse';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Generic error to prevent email enumeration
        setErrors({ general: 'Invalid credentials. Please check your email and password.' });
      } else if (result?.ok) {
        addToast('Welcome back!', `You are now logged in.`);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-marigold text-ink font-bold text-2xl mx-auto flex items-center justify-center shadow">
          ∞
        </div>
        <h1 className="text-3xl font-bold font-display text-ink">Welcome back</h1>
        <p className="text-slate text-sm">
          Log in to your Borrow Hub account to manage your borrows and listings.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8 space-y-6">
        {errors.general && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-display font-medium text-sm text-ink">Password</label>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full font-bold mt-2"
            isLoading={isLoading}
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-ink/10 text-xs text-slate">
          Don't have an account yet?{' '}
          <Link href="/signup" className="text-moss font-bold hover:underline">
            Sign up for Borrow Hub
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-slate">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
