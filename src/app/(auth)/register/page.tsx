'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getFriendlyErrorMessage } from '@/lib/error-messages';
import { postWithRetry } from '@/lib/api-client';
import { safeNext } from '@/lib/safeNext';
import { authPageHref, buildCallbackUrl, buildConfirmUrl } from '@/lib/authUrls';

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirect = safeNext(searchParams.get('redirect'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmAdult, setConfirmAdult] = useState(false);
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

    if (!confirmAdult) {
      setErrorMessage('You must confirm you are 18 or over to create an account');
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildConfirmUrl(window.location.origin, redirect),
        // handle_new_user() turns this into user_profiles.age_confirmed_at (ADR 0003).
        data: { age_confirmed: true },
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
    } catch {
      setErrorMessage('Failed to resend verification email. Please try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-heading font-semibold text-text-primary mb-6">Create account</h1>

      {errorMessage && (
        <div className="mb-4 p-3 bg-danger-surface border border-danger/40 text-danger text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-success-surface border border-success/40 text-success text-sm">
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

      <div className="mb-6">
          <button
            onClick={async () => {
              const supabase = createSupabaseBrowserClient();
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: buildCallbackUrl(window.location.origin, redirect),
                  scopes: 'openid email profile',
                },
              });
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-border rounded bg-surface hover:bg-surface-warm transition-colors text-text-primary"
            aria-label="Continue with Google"
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
            <span className="text-sm font-medium">Continue with Google</span>
          </button>
      </div>

      <p className="-mt-3 mb-6 text-xs text-text-primary/70">
        By continuing with Google you confirm you are 18 or over.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 border-t border-border"></div>
        <div className="text-sm text-text-secondary">Or</div>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
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
            name="password"
            type="password"
            autoComplete="new-password"
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
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
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
            name="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-text-primary/80">
            I agree to the{' '}
            <a href="/terms" className="inline-flex items-center min-h-[44px] text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="inline-flex items-center min-h-[44px] text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <label
          htmlFor="adult"
          className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-text-primary/80"
        >
          <input
            id="adult"
            name="adult"
            type="checkbox"
            checked={confirmAdult}
            onChange={(e) => setConfirmAdult(e.target.checked)}
          />
          <span>I am 18 or over</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-primary/70">
        Already have an account?{' '}
        <a href={authPageHref('/login', redirect)} className="inline-flex items-center min-h-[44px] text-primary hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
