'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { GalleryThumbnail, type GalleryThumbnailData } from './GalleryThumbnail';

interface PublicPractice {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  progressionCount: number;
  thumbnail: GalleryThumbnailData;
}

/** Public Practices, newest first, with title search. */
export function ExploreClient() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [practices, setPractices] = useState<PublicPractice[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (query: string, p: number) => {
    setLoading(true);
    setFailed(false);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (query) params.set('q', query);
      const res = await fetch(`/api/practices/public?${params}`);
      if (!res.ok) throw new Error('bad status');
      const body = await res.json();
      setPractices((prev) => (p === 1 ? body.practices : [...prev, ...body.practices]));
      setHasMore(body.hasMore);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(q, page);
  }, [q, page, load]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(input.trim());
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text-primary">Explore Practices</h1>
      <form onSubmit={search} className="mb-6 flex gap-2" role="search">
        <input
          type="search"
          aria-label="Search by title"
          placeholder="Search by title"
          maxLength={100}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[44px] min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="submit" className="min-h-[44px]">Search</Button>
      </form>

      {failed && <p role="alert" className="text-sm text-text-primary">Could not load Practices. Try again shortly.</p>}

      {!failed && !loading && practices.length === 0 && (
        <p className="text-sm text-text-primary">
          {q ? `No public Practices match "${q}".` : 'No public Practices yet.'}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {practices.map((p) => (
          <li key={p.id}>
            <Link
              href={`/p/${p.id}`}
              className="block border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <GalleryThumbnail {...p.thumbnail} />
              </div>
              <div className="p-3">
                <h2 className="truncate text-sm font-medium text-text-primary">{p.title}</h2>
                <p className="text-xs text-text-primary">
                  {p.progressionCount} {p.progressionCount === 1 ? 'Progression' : 'Progressions'}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {loading && <p role="status" className="mt-4 text-sm text-text-primary">Loading...</p>}
      {hasMore && !loading && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setPage((n) => n + 1)}>Load more</Button>
        </div>
      )}
    </main>
  );
}
