'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface PracticeReport {
  id: string;
  practice: {
    id: string;
    title: string;
    hidden: boolean;
    owner_id: string;
    owner_display_name: string | null;
  } | null;
  reporter: { id: string; display_name: string | null } | null;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

type PracticeAction = 'dismiss' | 'hide' | 'unhide' | 'delete' | 'ban_user';
type StatusFilter = 'open' | 'actioned' | 'dismissed';

/** Admin tab: Practice reports, with hide/unhide, delete, dismiss and ban owner. */
export function PracticeReportsTab() {
  const [status, setStatus] = useState<StatusFilter>('open');
  const [reports, setReports] = useState<PracticeReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ reportId: string; action: PracticeAction } | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/practice-reports?status=${status}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch reports');
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      console.error('[Admin] Practice reports error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (reportId: string, action: PracticeAction, why?: string) => {
    if ((action === 'hide' || action === 'ban_user') && !why) {
      setPending({ reportId, action });
      return;
    }
    if (action === 'delete' && !window.confirm('Delete this Practice permanently?')) return;

    setProcessingId(reportId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/practice-reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: why }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Action failed');
      setPending(null);
      setReason('');
      await load();
    } catch (err) {
      console.error('[Admin] Practice action error:', err);
      setError('That action failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const button = 'px-3 py-1.5 text-sm font-medium bg-surface-warm text-text-primary hover:bg-border disabled:opacity-50';

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Practice Reports ({total})</h2>
        <div className="flex gap-2">
          {(['open', 'actioned', 'dismissed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                status === s ? 'bg-primary text-text-inverse' : 'bg-surface-warm text-text-primary'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-danger-surface border border-danger/40 text-sm text-danger rounded">{error}</div>
      )}

      {loading ? (
        <p className="py-12 text-center text-text-primary/60">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="py-12 text-center text-text-primary/60">No {status} reports found.</p>
      ) : (
        <div className="divide-y divide-border">
          {reports.map((r) => (
            <div key={r.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-warm">{r.reason}</span>
                <span className="text-sm text-text-primary/60">{new Date(r.created_at).toLocaleString()}</span>
                {r.practice?.hidden && <span className="text-xs font-medium text-danger">Hidden</span>}
              </div>
              <p className="font-medium text-text-primary">
                {r.practice ? (
                  <Link href={`/p/${r.practice.id}`} className="underline" target="_blank" rel="noopener noreferrer">
                    {r.practice.title}
                  </Link>
                ) : (
                  'Deleted Practice'
                )}
                {r.practice && (
                  <span className="font-normal text-text-primary/60">
                    {' '}
                    by {r.practice.owner_display_name || 'Anonymous'}
                  </span>
                )}
              </p>
              {r.details && <p className="mt-1 text-sm text-text-primary/70">&quot;{r.details}&quot;</p>}
              <p className="mt-1 text-xs text-text-primary/60">
                Reported by: {r.reporter ? r.reporter.display_name || 'Anonymous User' : 'Signed-out viewer'}
              </p>
              {r.practice && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === 'open' && (
                    <button className={button} disabled={processingId === r.id} onClick={() => act(r.id, 'dismiss')}>
                      Dismiss
                    </button>
                  )}
                  <button
                    className={button}
                    disabled={processingId === r.id}
                    onClick={() => act(r.id, r.practice!.hidden ? 'unhide' : 'hide')}
                  >
                    {r.practice.hidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button className={button} disabled={processingId === r.id} onClick={() => act(r.id, 'delete')}>
                    Delete
                  </button>
                  <button className={button} disabled={processingId === r.id} onClick={() => act(r.id, 'ban_user')}>
                    Ban owner
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60">
          <div className="bg-surface border border-border w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">{pending.action === 'hide' ? 'Hide Practice' : 'Ban owner'}</h3>
            <p className="text-sm text-text-primary/70 mb-4">
              Please provide a reason for this action. This will be recorded for audit purposes.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 border border-border resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                className={button}
                onClick={() => {
                  setPending(null);
                  setReason('');
                }}
              >
                Cancel
              </button>
              <button
                disabled={!reason.trim() || processingId === pending.reportId}
                onClick={() => act(pending.reportId, pending.action, reason.trim())}
                className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {processingId === pending.reportId ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
