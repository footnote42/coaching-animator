'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function subscribeHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function hashTokens(hash: string) {
  const params = new URLSearchParams(hash.substring(1));
  return { accessToken: params.get('access_token'), refreshToken: params.get('refresh_token') };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // The email link carries the tokens in the URL hash; null on the server and first render (shows the loading state).
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => null);
  const { accessToken, refreshToken } = hash === null ? { accessToken: null, refreshToken: null } : hashTokens(hash);
  const hasToken = hash === null ? null : Boolean(accessToken && refreshToken);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }, [accessToken, refreshToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('[Auth] Password update error:', error);
      setErrorMessage('We could not update your password. The link may have expired; request a new one.');
      setLoading(false);
      return;
    }

    setSuccessMessage('Password updated successfully. Redirecting to login...');
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  // Show friendly message if no token is present
  if (hasToken === false) {
    return (
      <div>
        <h1 className="text-xl font-heading font-semibold text-text-primary mb-2">Reset Link Required</h1>
        <div className="mb-4 p-4 bg-surface-warm border border-border text-text-primary text-sm">
          <p className="font-medium mb-2">📧 Password reset link required</p>
          <p>This page requires a password reset link from your email.</p>
          <p className="mt-2">If you haven&apos;t requested a password reset yet, click the button below.</p>
        </div>
        <a
          href="/forgot-password"
          className="block w-full py-3 px-4 bg-primary text-text-inverse font-medium text-center hover:opacity-90 transition-opacity"
        >
          Request a New Reset Link
        </a>
        <div className="mt-6 text-center text-sm text-text-primary/70">
          <a href="/login" className="inline-flex items-center min-h-[44px] text-primary hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  // Show loading state while checking for token
  if (hasToken === null) {
    return <div className="text-center text-text-primary/70">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-heading font-semibold text-text-primary mb-2">Set New Password</h1>
      <p className="text-sm text-text-primary/70 mb-6">
        Enter your new password below.
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-danger-surface border border-danger/40 text-danger text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-success-surface border border-success/40 text-success text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
          <p className="text-xs text-text-primary/70 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-primary/70">
        <a href="/login" className="inline-flex items-center min-h-[44px] text-primary hover:underline">
          Back to sign in
        </a>
      </div>
    </div>
  );
}
