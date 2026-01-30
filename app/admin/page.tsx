'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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

type ReportAction = 'dismiss' | 'hide' | 'delete' | 'warn_user' | 'ban_user';

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'dismissed'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState<{ reportId: string; action: ReportAction } | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const checkAdminAccess = async () => {
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
  };

  const fetchReports = async () => {
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
  };

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

      // Remove the report from the list or refresh
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <a href="/app" className="text-sm text-emerald-600 hover:text-emerald-700">
              ← Back to App
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Content Reports ({total})
              </h2>
              <div className="flex gap-2">
                {(['pending', 'reviewed', 'dismissed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      statusFilter === status
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No {statusFilter} reports found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="px-6 py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getReasonBadgeColor(report.reason)}`}>
                          {report.reason}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(report.created_at)}
                        </span>
                      </div>

                      <div className="mb-2">
                        <h3 className="font-medium text-gray-900">
                          {report.animation?.title || 'Deleted Animation'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          by {report.animation?.author_display_name || 'Anonymous'}
                        </p>
                      </div>

                      {report.details && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mb-2">
                          "{report.details}"
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        Reported by: {report.reporter?.display_name || 'Anonymous User'}
                      </p>

                      {report.animation?.id && (
                        <a
                          href={`/gallery/${report.animation.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 inline-block"
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
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
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
        </div>
      </main>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showReasonModal.action === 'hide' && 'Hide Animation'}
              {showReasonModal.action === 'warn_user' && 'Warn User'}
              {showReasonModal.action === 'ban_user' && 'Ban User'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for this action. This will be recorded for audit purposes.
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(null);
                  setActionReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showReasonModal.reportId, showReasonModal.action, actionReason)}
                disabled={!actionReason.trim() || processingId === showReasonModal.reportId}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
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
