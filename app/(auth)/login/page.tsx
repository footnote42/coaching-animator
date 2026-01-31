'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import { getFriendlyErrorMessage } from '@/lib/error-messages';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/app';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(error === 'auth_failed' ? 'Authentication failed. Please try again.' : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const supabase = createSupabaseBrowserClient();

    // Create a promise that resolves when session is confirmed
    const sessionReady = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Session confirmation timeout'));
      }, 10000); // 10 second timeout

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          clearTimeout(timeout);
          subscription.unsubscribe();
          resolve();
        }
      });
    });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      setLoading(false);
      return;
    }

    try {
      // Wait for session to be fully established
      await sessionReady;
      // Now navigate - cookies should be synchronized
      router.push(redirect);
      router.refresh();
    } catch (timeoutError) {
      // Fallback: navigate anyway after timeout
      console.warn('Session confirmation timeout, navigating anyway');
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Sign In</h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="coach@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <a href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      <div className="mt-4 text-center text-sm text-text-primary/70">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-primary hover:underline">
          Sign up
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
