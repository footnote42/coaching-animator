'use client';

import { useState } from 'react';
import { useUser } from '@/lib/contexts/UserContext';

/**
 * Blocking dialog shown once after sign-in to accounts that have not yet
 * declared they are 18 or over (existing accounts and Google sign-ups).
 * See docs/adr/0003-accounts-are-18-plus.md.
 */
export function AgeConfirmationDialog() {
  const { user, profile, loading, signOut, refreshProfile } = useUser();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Only when we know for sure it is unset (undefined means the profile failed to load).
  if (loading || !user || !profile || profile.age_confirmed_at !== null) return null;

  const confirm = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/user/age-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await refreshProfile();
    } catch {
      setError('Could not save your confirmation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-dialog-title"
        className="w-full max-w-md bg-surface border border-border p-6 shadow-xl"
      >
        <h2 id="age-dialog-title" className="text-xl font-heading font-semibold text-text-primary mb-2">
          Confirm your age
        </h2>
        <p className="text-sm text-text-primary/80 mb-4">
          Coaching Animator accounts are for people aged 18 or over. Please confirm to carry on.
          You can still use the editor as a Guest without an account.
        </p>
        <div className="flex items-start gap-2 mb-4">
          <input
            id="age-dialog-check"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="age-dialog-check" className="text-sm text-text-primary">
            I am 18 or over
          </label>
        </div>
        {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={confirm}
            disabled={!checked || saving}
            className="px-4 py-2 min-h-[44px] bg-primary text-text-inverse font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="px-4 py-2 min-h-[44px] border border-border text-text-primary hover:bg-surface-warm"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
