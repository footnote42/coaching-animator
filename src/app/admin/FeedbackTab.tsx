'use client';

import { useCallback, useEffect, useState } from 'react';

interface FeedbackItem {
  id: string;
  name: string;
  email: string | null;
  area: string;
  what: string;
  rating: string;
  created_at: string;
  read_at: string | null;
}

/** Admin tab: feedback submissions, newest first, with "mark read". */
export function FeedbackTab() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch feedback');
      setItems(data.feedback);
      setTotal(data.total);
    } catch (err) {
      console.error('[Admin] Feedback error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    setProcessingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${id}/read`, { method: 'POST' });
      if (!res.ok) throw new Error('Mark read failed');
      await load();
    } catch (err) {
      console.error('[Admin] Feedback mark read error:', err);
      setError('That action failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Feedback ({total})</h2>

      {error && (
        <div className="mb-4 px-4 py-3 bg-danger-surface border border-danger/40 text-sm text-danger rounded">{error}</div>
      )}

      {loading ? (
        <p className="py-12 text-center text-text-primary/60">Loading feedback...</p>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-text-primary/60">No feedback yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((f) => (
            <div key={f.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-warm">{f.area}</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-warm">{f.rating}</span>
                <span className="text-sm text-text-primary/60">{new Date(f.created_at).toLocaleString()}</span>
                {!f.read_at && <span className="text-xs font-medium text-danger">New</span>}
              </div>
              <p className="font-medium text-text-primary">
                {f.name}
                {f.email && (
                  <a href={`mailto:${f.email}`} className="ml-2 font-normal underline text-text-primary/60">
                    {f.email}
                  </a>
                )}
              </p>
              <p className="mt-1 text-sm text-text-primary/80 whitespace-pre-wrap">{f.what}</p>
              {!f.read_at && (
                <button
                  className="mt-3 px-3 py-1.5 text-sm font-medium bg-surface-warm text-text-primary hover:bg-border disabled:opacity-50"
                  disabled={processingId === f.id}
                  onClick={() => markRead(f.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
