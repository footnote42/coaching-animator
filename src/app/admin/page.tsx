'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminReport {
  id: string;
  animation: {
    id: string;
    title: string;
    user_id: string;
    author_display_name: string | null;
  } | null;
  reporter: {
    id: string;
    display_name: string | null;
  } | null;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

interface AdminAnimation {
  id: string;
  title: string;
  animation_type: string;
  visibility: string;
  tags: string[];
  created_at: string;
  user_id: string;
}

type ReportAction = 'dismiss' | 'hide' | 'delete' | 'warn_user' | 'ban_user';
type AdminTab = 'reports' | 'animations';

// ---------------------------------------------------------------------------
// AnimationsTab
// ---------------------------------------------------------------------------

function AnimationsTab() {
  const [animations, setAnimations] = useState<AdminAnimation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminAnimation | null>(null);
  const [togglingTemplate, setTogglingTemplate] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const LIMIT = 20;

  const fetchAnimations = useCallback(async (searchVal: string, offsetVal: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(offsetVal),
      });
      if (searchVal) params.set('search', searchVal);
      const res = await fetch(`/api/admin/animations?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch');
      setAnimations(data.animations);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimations(search, offset);
  }, [fetchAnimations, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchAnimations(val, 0);
    }, 300);
  };

  const handleDelete = async (animation: AdminAnimation) => {
    setDeletingId(animation.id);
    setError(null);
    try {
      const res = await fetch('/api/admin/animations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: animation.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Delete failed');
      setAnimations(prev => prev.filter(a => a.id !== animation.id));
      setTotal(prev => prev - 1);
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleTemplate = async (anim: AdminAnimation) => {
    const isTemplate = anim.tags?.includes('template') ?? false;
    setTogglingTemplate(anim.id);
    setError(null);
    try {
      const res = await fetch('/api/admin/animations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: anim.id, isTemplate: !isTemplate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to update');
      setAnimations(prev => prev.map(a =>
        a.id === anim.id ? { ...a, tags: data.tags } : a
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle template');
    } finally {
      setTogglingTemplate(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  const hasPrev = offset > 0;
  const hasNext = offset + LIMIT < total;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-text-primary/60">{total} total animations</span>
        <input
          type="text"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search by title…"
          className="px-3 py-1.5 text-sm border border-border rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-sm text-red-600 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-text-primary/60">Loading animations…</p>
        </div>
      ) : animations.length === 0 ? (
        <div className="py-12 text-center text-text-primary/60">No animations found.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-text-primary/60 border-b border-border">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Visibility</th>
              <th className="pb-2 font-medium">Created</th>
              <th className="pb-2 font-medium">Template</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {animations.map(anim => (
              <tr key={anim.id}>
                <td className="py-2 pr-4 font-medium text-text-primary max-w-xs truncate">{anim.title || 'Untitled'}</td>
                <td className="py-2 pr-4 text-text-primary/70">{anim.animation_type}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    anim.visibility === 'public'
                      ? 'bg-green-100 text-green-800'
                      : anim.visibility === 'private'
                      ? 'bg-surface-warm text-text-primary'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {anim.visibility}
                  </span>
                </td>
                <td className="py-2 pr-4 text-text-primary/60">{formatDate(anim.created_at)}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleToggleTemplate(anim)}
                    disabled={togglingTemplate === anim.id}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                      anim.tags?.includes('template')
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-surface-warm text-text-primary/60 hover:bg-surface-warm'
                    }`}
                  >
                    {togglingTemplate === anim.id ? '...' : anim.tags?.includes('template') ? 'Template' : 'Set Template'}
                  </button>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => setConfirmDelete(anim)}
                    disabled={deletingId === anim.id}
                    className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
            disabled={!hasPrev}
            className="px-3 py-1.5 text-sm font-medium text-text-primary bg-surface-warm rounded hover:bg-surface-warm disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setOffset(o => o + LIMIT)}
            disabled={!hasNext}
            className="px-3 py-1.5 text-sm font-medium text-text-primary bg-surface-warm rounded hover:bg-surface-warm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Animation</h3>
            <p className="text-sm text-text-primary/70 mb-4">
              Permanently delete <strong>&quot;{confirmDelete.title || 'Untitled'}&quot;</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-warm rounded-lg hover:bg-surface-warm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminPage
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('reports');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'dismissed'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState<{ reportId: string; action: ReportAction } | null>(null);

  const checkAdminAccess = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push('/app');
      return;
    }
  }, [router]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports?status=${statusFilter}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          router.push('/app');
          return;
        }
        throw new Error(data.error?.message || 'Failed to fetch reports');
      }

      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    if (activeTab === 'reports') fetchReports();
  }, [fetchReports, activeTab]);

  const handleAction = async (reportId: string, action: ReportAction, reason?: string) => {
    if (['hide', 'warn_user', 'ban_user'].includes(action) && !reason) {
      setShowReasonModal({ reportId, action });
      return;
    }

    setProcessingId(reportId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Action failed');
      }

      setReports(prev => prev.filter(r => r.id !== reportId));
      setTotal(prev => prev - 1);
      setShowReasonModal(null);
      setActionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case 'inappropriate': return 'bg-red-100 text-red-800';
      case 'spam': return 'bg-yellow-100 text-yellow-800';
      case 'copyright': return 'bg-purple-100 text-purple-800';
      default: return 'bg-surface-warm text-text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border">
          {/* Tab bar */}
          <div className="border-b border-border px-6">
            <div className="flex gap-0">
              {(['reports', 'animations'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-primary/60 hover:text-text-primary'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Reports tab */}
            {activeTab === 'reports' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Content Reports ({total})
                  </h2>
                  <div className="flex gap-2">
                    {(['pending', 'reviewed', 'dismissed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status
                          ? 'bg-primary text-text-inverse'
                          : 'bg-surface-warm text-text-primary hover:bg-surface-warm'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-sm text-red-600 rounded">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-text-primary/60">Loading reports...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-text-primary/60">No {statusFilter} reports found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {reports.map((report) => (
                      <div key={report.id} className="py-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getReasonBadgeColor(report.reason)}`}>
                                {report.reason}
                              </span>
                              <span className="text-xs text-text-primary/60">
                                {formatDate(report.created_at)}
                              </span>
                            </div>

                            <div className="mb-2">
                              <h3 className="font-medium text-text-primary">
                                {report.animation?.title || 'Deleted Animation'}
                              </h3>
                              <p className="text-sm text-text-primary/60">
                                by {report.animation?.author_display_name || 'Anonymous'}
                              </p>
                            </div>

                            {report.details && (
                              <p className="text-sm text-text-primary/70 bg-surface-warm rounded p-2 mb-2">
                                &quot;{report.details}&quot;
                              </p>
                            )}

                            <p className="text-xs text-text-primary/60">
                              Reported by: {report.reporter?.display_name || 'Anonymous User'}
                            </p>

                            {report.animation?.id && (
                              <a
                                href={`/gallery/${report.animation.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 mt-1 inline-block"
                              >
                                View Animation →
                              </a>
                            )}
                          </div>

                          {statusFilter === 'pending' && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleAction(report.id, 'dismiss')}
                                disabled={processingId === report.id}
                                className="px-3 py-1.5 text-xs font-medium text-text-primary bg-surface-warm rounded hover:bg-surface-warm disabled:opacity-50"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleAction(report.id, 'hide')}
                                disabled={processingId === report.id}
                                className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 disabled:opacity-50"
                              >
                                Hide
                              </button>
                              <button
                                onClick={() => handleAction(report.id, 'delete')}
                                disabled={processingId === report.id}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleAction(report.id, 'warn_user')}
                                disabled={processingId === report.id}
                                className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200 disabled:opacity-50"
                              >
                                Warn User
                              </button>
                              <button
                                onClick={() => handleAction(report.id, 'ban_user')}
                                disabled={processingId === report.id}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Ban User
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Animations tab */}
            {activeTab === 'animations' && <AnimationsTab />}
          </div>
        </div>
      </main>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {showReasonModal.action === 'hide' && 'Hide Animation'}
              {showReasonModal.action === 'warn_user' && 'Warn User'}
              {showReasonModal.action === 'ban_user' && 'Ban User'}
            </h3>
            <p className="text-sm text-text-primary/70 mb-4">
              Please provide a reason for this action. This will be recorded for audit purposes.
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(null);
                  setActionReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-warm rounded-lg hover:bg-surface-warm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showReasonModal.reportId, showReasonModal.action, actionReason)}
                disabled={!actionReason.trim() || processingId === showReasonModal.reportId}
                className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {processingId === showReasonModal.reportId ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
