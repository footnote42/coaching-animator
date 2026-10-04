'use client';

import { useState } from 'react';
import { X, Flag, Check } from 'lucide-react';
import { PRACTICE_REPORT_REASONS } from '@/lib/schemas/practices';

type Reason = (typeof PRACTICE_REPORT_REASONS)[number];

const REASONS: { value: Reason; label: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'safeguarding', label: 'Safeguarding concern' },
  { value: 'other', label: 'Other' },
];

interface ReportPracticeDialogProps {
  practiceId: string;
  onClose: () => void;
}

/** Report a Practice. Works signed out. Render it only while open. */
export function ReportPracticeDialog({ practiceId, onClose }: ReportPracticeDialogProps) {
  const [reason, setReason] = useState<Reason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/practices/${practiceId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details: details.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message || 'Failed to submit report');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="report-practice-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-scrim">
      <div className="mx-4 w-full max-w-md border border-[var(--color-border)] bg-[var(--color-surface)] text-text-primary shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5" aria-hidden />
            <h2 id="report-practice-title" className="text-lg font-semibold">Report Practice</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center" role="status">
            <Check className="mx-auto mb-3 h-8 w-8" aria-hidden />
            <p className="font-semibold">Report submitted</p>
            <p className="mt-1 text-sm">Thank you. We will review it.</p>
            <button type="button" onClick={onClose} className="mt-4 min-h-11 border border-[var(--color-border)] px-4">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-4">
            <fieldset className="mb-4 space-y-2">
              <legend className="mb-2 text-sm">Why are you reporting this Practice?</legend>
              {REASONS.map((o) => (
                <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 border border-[var(--color-border)] px-3">
                  <input type="radio" name="reason" value={o.value} checked={reason === o.value} onChange={() => setReason(o.value)} />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </fieldset>

            <label className="mb-1 block text-sm font-medium" htmlFor="report-details">Details (optional)</label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full resize-none border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />

            {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={onClose} className="min-h-11 flex-1 border border-[var(--color-border)]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason || submitting}
                className="min-h-11 flex-1 bg-danger font-medium text-background disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
