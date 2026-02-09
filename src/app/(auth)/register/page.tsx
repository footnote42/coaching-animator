'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getFriendlyErrorMessage } from '@/lib/error-messages';
import { postWithRetry } from '@/lib/api-client';

export default function RegisterPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);

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

    if (!acceptTerms) {
      setErrorMessage('You must accept the Terms of Service');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      setLoading(false);
      return;
    }

    setSuccessMessage('Check your email for a confirmation link to complete registration.');
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address first');
      return;
    }

    setResendingVerification(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { ok, status, error: apiError } = await postWithRetry('/api/auth/resend-verification', { email });

      if (!ok) {
        setErrorMessage(apiError || `Failed to resend verification email (${status})`);
        return;
      }

      setSuccessMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setErrorMessage('Failed to resend verification email. Please try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Create Account</h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
          <p>{successMessage}</p>
          <p className="mt-2 text-xs">
            Didn&apos;t receive the email?{' '}
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="text-primary hover:underline disabled:opacity-50"
            >
              {resendingVerification ? 'Sending...' : 'Resend verification email'}
            </button>
          </p>
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
            minLength={8}
            className="w-full px-3 py-2 border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
          <p className="text-xs text-text-primary/60 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
            Confirm Password
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

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-text-primary/80">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm text-center text-text-secondary mb-4">
          Or continue with
        </p>

        <button
          onClick={async () => {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
                scopes: 'openid email profile',
              },
            });
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-border rounded bg-white hover:bg-gray-50 transition-colors text-text-primary"
          aria-label="Sign up with Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">Sign up with Google</span>
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-text-primary/70">
        Already have an account?{' '}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
