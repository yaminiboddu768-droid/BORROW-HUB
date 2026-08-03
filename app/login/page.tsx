'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
  const [loginType, setLoginType] = useState<'customer' | 'partner'>('customer');
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
        loginType,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: result.error });
      } else if (result?.ok) {
        const session = await getSession();
        addToast('Welcome back!', `You are now logged in.`);
        
        const userRole = (session?.user as any)?.role || 'customer';
        const partnerStatus = (session?.user as any)?.partnerStatus || 'none';

        if (userRole === 'partner') {
          if (partnerStatus === 'approved') {
            router.push('/partner/dashboard');
          } else if (partnerStatus === 'pending') {
            router.push('/partner/pending');
          } else if (partnerStatus === 'rejected') {
            router.push('/partner/rejected');
          } else {
            router.push(callbackUrl);
          }
        } else {
          // If a customer tries to log in as partner, we can still just route them to customer dash
          // Or we could show an error, but routing to customer dash is safest
          router.push(callbackUrl);
        }
        
        router.refresh();
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user.email;
      const name = result.user.displayName;
      
      if (!email) throw new Error("Google sign in failed. No email provided.");

      const nextAuthResult = await signIn('credentials', {
        email: email.toLowerCase(),
        name: name || "Google User",
        isFirebase: 'true',
        loginType,
        redirect: false,
      });

      if (nextAuthResult?.error) {
        setErrors({ general: nextAuthResult.error });
      } else if (nextAuthResult?.ok) {
        const session = await getSession();
        addToast('Welcome back!', `You are now logged in.`);
        
        const userRole = (session?.user as any)?.role || 'customer';
        const partnerStatus = (session?.user as any)?.partnerStatus || 'none';

        if (userRole === 'partner') {
          if (partnerStatus === 'approved') {
            router.push('/partner/dashboard');
          } else if (partnerStatus === 'pending') {
            router.push('/partner/pending');
          } else if (partnerStatus === 'rejected') {
            router.push('/partner/rejected');
          } else {
            router.push(callbackUrl);
          }
        } else {
          router.push(callbackUrl);
        }
        
        router.refresh();
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, do nothing
      } else {
        setErrors({ general: 'An unexpected error occurred with Google Sign-In.' });
      }
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
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              loginType === 'customer' ? 'bg-white shadow text-ink' : 'text-slate-500 hover:text-ink'
            }`}
            onClick={() => setLoginType('customer')}
          >
            Customer
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              loginType === 'partner' ? 'bg-white shadow text-ink' : 'text-slate-500 hover:text-ink'
            }`}
            onClick={() => setLoginType('partner')}
          >
            Business Partner
          </button>
        </div>

        {loginType === 'partner' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <div>
              <span className="font-bold">Approved Partner Demo:</span> partner@borrowhub.com
            </div>
            <button
              type="button"
              className="text-xs font-bold text-amber-900 underline hover:text-ink ml-2 shrink-0"
              onClick={() => {
                setEmail('partner@borrowhub.com');
                setPassword('password123');
              }}
            >
              Fill Credentials
            </button>
          </div>
        )}

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
            <span>{loginType === 'partner' ? 'Log In as Partner' : 'Log In'}</span>
          </Button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full font-bold"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-ink/10 text-xs text-slate">
          {loginType === 'customer' ? (
            <>
              Don't have an account yet?{' '}
              <Link href="/signup" className="text-moss font-bold hover:underline">
                Sign up for Borrow Hub
              </Link>
            </>
          ) : (
            <>
              Want to become a partner?{' '}
              <Link href="/partner/register" className="text-moss font-bold hover:underline">
                Register your business here
              </Link>
            </>
          )}
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
