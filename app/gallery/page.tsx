'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ArrowUpDown, Loader2, X } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PublicAnimationCard } from '@/components/PublicAnimationCard';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { AnimationType } from '@/lib/schemas/animations';
import { getWithRetry } from '@/lib/api-client';
import { getFriendlyErrorMessage } from '@/lib/error-messages';
import { useUser } from '@/lib/contexts/UserContext';

interface PublicAnimation {
  id: string;
  title: string;
  description: string | null;
  animation_type: AnimationType;
  tags: string[];
  duration_ms: number;
  frame_count: number;
  upvote_count: number;
  created_at: string;
  user_id?: string;
  author: {
    display_name: string | null;
  };
  user_has_upvoted: boolean;
}

type SortField = 'created_at' | 'upvote_count';
type SortOrder = 'asc' | 'desc';

const TYPE_OPTIONS: { value: AnimationType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'tactic', label: 'Tactics' },
  { value: 'skill', label: 'Skills' },
  { value: 'game', label: 'Games' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Newest' },
  { value: 'upvote_count', label: 'Most Upvoted' },
];

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user: authUser } = useUser();
  const [animations, setAnimations] = useState<PublicAnimation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = authUser?.id ?? null;
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [type, setType] = useState<AnimationType | ''>(
    (searchParams.get('type') as AnimationType) || ''
  );
  const [sort, setSort] = useState<SortField>(
    (searchParams.get('sort') as SortField) || 'created_at'
  );
  const [order, setOrder] = useState<SortOrder>(
    (searchParams.get('order') as SortOrder) || 'desc'
  );
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (type) params.set('type', type);
      params.set('sort', sort);
      params.set('order', order);
      params.set('limit', String(limit));
      params.set('offset', String(offset));

      const { ok, data, status, error: apiError } = await getWithRetry<{ animations: PublicAnimation[]; total: number }>(
        `/api/gallery?${params}`
      );

      if (!ok) {
        throw new Error(apiError || `Failed to fetch gallery (${status})`);
      }

      if (data) {
        setAnimations(data.animations);
        setTotal(data.total);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [search, type, sort, order, offset]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchGallery();
  };

  const handleTypeChange = (newType: AnimationType | '') => {
    setType(newType);
    setOffset(0);
  };

  const handleSortChange = (newSort: SortField) => {
    if (newSort === sort) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(newSort);
      setOrder('desc');
    }
    setOffset(0);
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setSort('created_at');
    setOrder('desc');
    setOffset(0);
  };

  const hasFilters = search || type;

  const handleView = (id: string) => {
    router.push(`/gallery/${id}`);
  };

  const handleUpvote = async (id: string): Promise<{ upvoted: boolean; upvote_count: number } | null> => {
    try {
      const response = await fetch(`/api/animations/${id}/upvote`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        alert(data.error?.message || `Failed to upvote (${response.status})`);
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
      alert(`Failed to upvote: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    return null;
  };

  const handleLoginRequired = () => {
    router.push('/login?redirect=/gallery');
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <header className="border-b border-border bg-primary text-text-inverse">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Public Gallery
          </h1>
          <p className="text-text-inverse/80">
            Explore rugby animations shared by coaches worldwide
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search animations..."
                  className="w-full pl-10 pr-4 py-2 border border-border bg-surface focus:border-primary focus:outline-none"
                />
              </div>
            </form>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-primary/70" />
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as AnimationType | '')}
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

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-text-primary/70" />
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${sort === option.value
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

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-text-primary/70 hover:text-text-primary"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results info */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-sm text-text-primary/70">
          {total} animation{total !== 1 ? 's' : ''} found
          {hasFilters && ' matching your filters'}
        </p>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchGallery}
              className="px-4 py-2 bg-primary text-text-inverse font-medium"
            >
              Try Again
            </button>
          </div>
        ) : animations.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={handleClearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {animations.map((animation) => (
                <PublicAnimationCard
                  key={animation.id}
                  animation={animation}
                  onView={handleView}
                  currentUserId={currentUserId}
                  onUpvote={handleUpvote}
                  onLoginRequired={handleLoginRequired}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-text-primary/70">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean | string; onClear: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🏉</div>
      <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
        {hasFilters ? 'No Animations Found' : 'Gallery is Empty'}
      </h2>
      <p className="text-text-primary/70 mb-6 max-w-md mx-auto">
        {hasFilters
          ? 'Try adjusting your filters or search terms'
          : 'Be the first to share your rugby animations with the community!'}
      </p>
      {hasFilters ? (
        <button
          onClick={onClear}
          className="px-4 py-2 border border-border hover:border-primary"
        >
          Clear Filters
        </button>
      ) : (
        <a
          href="/app"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
        >
          Create Animation
        </a>
      )}
    </div>
  );
}
