'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Step 1: Create the account via backend API
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase(), password }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        if (signupRes.status === 409) {
          setErrors({ email: signupData.error?.message || 'Email is already registered.' });
        } else if (signupRes.status === 400) {
          setErrors({ general: signupData.error?.message || 'Invalid input. Please check your details.' });
        } else {
          setErrors({ general: 'Signup failed. Please try again.' });
        }
        return;
      }

      // Step 2: Automatically sign in the user
      const signInResult = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        addToast('Account Created!', `Welcome to Borrow Hub, ${name.trim()}!`);
        router.push('/');
        router.refresh();
      } else {
        // Account was created but auto-login failed — send to login page
        addToast('Account Created!', 'Please log in to continue.');
        router.push('/login');
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <img src="/logo.png" alt="Borrow Hub Logo" className="w-12 h-12 object-contain mx-auto rounded-2xl shadow" />
        <h1 className="text-3xl font-bold font-display text-ink">Join Borrow Hub</h1>
        <p className="text-slate text-sm">
          Create your account to start borrowing and sharing with your neighbours.
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
            label="Full Name"
            placeholder="Sarah Miller"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold mt-2"
            isLoading={isLoading}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-ink/10 text-xs text-slate">
          Already have an account?{' '}
          <Link href="/login" className="text-marigold font-bold hover:underline">
            Log in to Borrow Hub
          </Link>
        </div>
      </Card>
    </div>
  );
}
