'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      console.error('[Auth] Reset request error:', error);
      setErrorMessage('We could not send the reset email. Please check the address and try again.');
      setLoading(false);
      return;
    }

    setSuccessMessage('Check your email for a password reset link. The link will expire in 1 hour.');
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-heading font-semibold text-text-primary mb-2">Reset Password</h1>
      <p className="text-sm text-text-primary/70 mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-danger-surface border border-danger/40 text-danger text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-success-surface border border-success/40 text-success text-sm">
          <p className="font-medium mb-2">📧 Email sent!</p>
          <p>{successMessage}</p>
          <p className="mt-2 text-xs">
            <strong>Tip:</strong> If you don&apos;t see the email, check your spam folder.
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-primary/70">
        Remember your password?{' '}
        <a href="/login" className="inline-flex items-center min-h-[44px] text-primary hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
