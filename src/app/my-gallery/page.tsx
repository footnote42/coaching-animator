'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown, Plus, Loader2, FolderOpen, Search, Filter } from 'lucide-react';
import { AnimationCard, AnimationSummary } from '@/features/gallery/components/AnimationCard';
import { EditMetadataModal } from '@/shared/components/EditMetadataModal';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';
import { LinkToFoundationModal } from '@/shared/components/LinkToFoundationModal';
import { MyAnimationsQuery } from '@/lib/schemas/animations';
import { getWithRetry, deleteWithRetry } from '@/lib/api-client';
import { useUser } from '@/lib/contexts/UserContext';

type SortField = MyAnimationsQuery['sort'];
type SortOrder = MyAnimationsQuery['order'];

const LIMIT = 24;

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'duration_ms', label: 'Duration' },
  { value: 'animation_type', label: 'Type' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'tactic', label: 'Tactics' },
  { value: 'skill', label: 'Skills' },
  { value: 'game', label: 'Games' },
  { value: 'other', label: 'Other' },
] as const;

function MyGalleryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();

  const [animations, setAnimations] = useState<AnimationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // URL-driven state (T010)
  const sort = (searchParams.get('sort') ?? 'created_at') as SortField;
  const order = (searchParams.get('order') ?? 'desc') as SortOrder;
  const q = searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? '';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to update URL params (T011)
  const updateURL = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const fetchAnimations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Forward all four params to API (T010 / FR-003a)
      const params = new URLSearchParams({
        sort,
        order,
        limit: String(LIMIT),
        offset: String((page - 1) * LIMIT),
      });
      if (q) params.set('q', q);
      if (type) params.set('type', type);

      const { ok, data, status, error: apiError } = await getWithRetry<{ animations: AnimationSummary[]; total: number }>(
        `/api/animations?${params}`
      );

      if (!ok) {
        if (status === 401) {
          router.push('/login?redirect=/my-gallery');
          return;
        }
        throw new Error(apiError || `Failed to fetch animations (${status})`);
      }

      if (data) {
        setAnimations(data.animations);
        setTotal(data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sort, order, page, q, type, router]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login?redirect=/my-gallery');
      return;
    }

    fetchAnimations();
  }, [authLoading, user, fetchAnimations, router]);

  // Client-side filtering (T012) — derives from loaded animations
  const filteredAnimations = animations
    .filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q.toLowerCase()) ||
        (a.description as string | undefined)?.toLowerCase().includes(q.toLowerCase())
    )
    .filter((a) => !type || a.animation_type === type);

  const handleSortChange = (newSort: SortField) => {
    const newOrder = newSort === sort ? (order === 'asc' ? 'desc' : 'asc') : 'desc';
    updateURL({ sort: newSort, order: newOrder });
  };

  const handleEdit = (id: string) => setEditingId(id);

  const handleEditSave = async (updated: Partial<AnimationSummary>) => {
    setAnimations((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a)));
    setEditingId(null);
  };

  const handleDelete = (id: string) => setDeletingId(id);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const { ok, status, error: apiError } = await deleteWithRetry(`/api/animations/${deletingId}`);

      if (!ok) {
        throw new Error(apiError || `Failed to delete animation (${status})`);
      }

      setDeletingId(null);
      await fetchAnimations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setError(message);
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlay = (id: string) => {
    router.push(`/share/${id}`);
  };

  const handleLinkToFoundation = (id: string) => setLinkingId(id);

  const handleLinkSuccess = async () => {
    setLinkingId(null);
    await fetchAnimations();
  };

  const editingAnimation = editingId ? animations.find((a) => a.id === editingId) : null;
  const deletingAnimation = deletingId ? animations.find((a) => a.id === deletingId) : null;
  const linkingAnimation = linkingId ? animations.find((a) => a.id === linkingId) : null;

  const hasSearchOrFilter = !!(q || type);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-border bg-[var(--color-surface-warm)] relative overflow-hidden">
        {/* Tactical Motif Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="40" cy="40" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tactical-grid)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              My Playbook
            </h1>
            <p className="text-text-primary/70">
              {total} animation{total !== 1 ? 's' : ''} saved
            </p>
          </div>
          <a
            href="/app"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors rounded-none"
          >
            <Plus className="w-4 h-4" />
            New Animation
          </a>
        </div>
      </header>

      {/* Search + Filter + Sort controls (T011) */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b border-border bg-surface-warm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search input */}
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary/50" />
            <input
              id="my-gallery-search"
              type="text"
              value={q}
              onChange={(e) => updateURL({ q: e.target.value })}
              placeholder="Search your drills..."
              aria-label="Search your animations"
              className="w-full pl-10 pr-4 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-primary/70" />
            <select
              id="my-gallery-type-filter"
              value={type}
              onChange={(e) => updateURL({ type: e.target.value })}
              className="px-3 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
              aria-label="Filter by animation type"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-text-primary/70" />
            <span className="text-sm text-text-primary/70 mr-2">Sort by:</span>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  sort === option.value
                    ? 'bg-primary text-text-inverse'
                    : 'bg-surface border border-border hover:border-primary'
                }`}
              >
                {option.label}
                {sort === option.value && (
                  <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAnimations}
              className="px-4 py-2 bg-primary text-text-inverse font-medium"
            >
              Try Again
            </button>
          </div>
        ) : animations.length === 0 && !hasSearchOrFilter ? (
          <EmptyState />
        ) : filteredAnimations.length === 0 ? (
          // Search/filter empty state (T012)
          <div className="text-center py-20">
            <p className="text-text-primary/70 mb-4">
              No drills matching{q ? ` "${q}"` : ''}
              {type ? ` of type "${type}"` : ''} — try a different search.
            </p>
            <button
              onClick={() => updateURL({ q: '', type: '' })}
              className="px-4 py-2 border border-border hover:border-primary transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAnimations.map((animation) => (
                <AnimationCard
                  key={animation.id}
                  animation={animation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPlay={handlePlay}
                  onLinkToFoundation={handleLinkToFoundation}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-center gap-4 mt-12 border-t border-border pt-6">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border bg-surface hover:bg-surface-warm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="text-sm font-medium text-text-primary">
                  Page {page} of {Math.ceil(total / LIMIT)}
                </div>
                <button
                  onClick={() => {
                    setPage((p) => Math.min(Math.ceil(total / LIMIT), p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === Math.ceil(total / LIMIT)}
                  className="px-4 py-2 border border-border bg-surface hover:bg-surface-warm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editingAnimation && (
        <EditMetadataModal
          animation={editingAnimation}
          onClose={() => setEditingId(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation */}
      {deletingAnimation && (
        <DeleteConfirmDialog
          title={deletingAnimation.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {/* Link To Foundation Modal */}
      {linkingAnimation && (
        <LinkToFoundationModal
          animation={linkingAnimation}
          onClose={() => setLinkingId(null)}
          onSuccess={handleLinkSuccess}
        />
      )}
    </div>
  );
}

export default function MyGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <MyGalleryContent />
    </Suspense>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 bg-surface-warm border-2 border-dashed border-border flex items-center justify-center">
        <FolderOpen className="w-12 h-12 text-text-primary/30" />
      </div>
      <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
        Your Playbook is Empty
      </h2>
      <p className="text-text-primary/70 mb-6 max-w-md mx-auto">
        Build your first drill in the editor and save it to build your personal playbook.
      </p>
      <a
        href="/app"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Your First Animation
      </a>
    </div>
  );
}
