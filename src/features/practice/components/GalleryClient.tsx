'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { ReportPracticeDialog } from './ReportPracticeDialog';
import { PracticeThumbnail } from './PracticeThumbnail';
import type { ResolvedStep } from '@/features/practice/engine';
import { PRACTICE_TAGS, type PracticeTag } from '@/lib/practice-tags';

interface PublicPractice {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  progressionCount: number;
  tags: string[];
  /** Players on the field in the base Step; null if the script could not be read. */
  playerCount: number | null;
  area: { width: number; length: number } | null;
  coachName: string | null;
  hasSource: boolean;
  /** The base Step, or null if the script could not be read. */
  thumbnail: ResolvedStep | null;
}

/** The Gallery: public Practices, newest first, with title search and a Tag filter kept in the URL. */
export function GalleryClient() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const tagParam = useSearchParams().get('tag');
  const tag = PRACTICE_TAGS.find((t) => t === tagParam) ?? null;
  const [page, setPage] = useState(1);
  const [practices, setPractices] = useState<PublicPractice[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const load = useCallback(async (query: string, tagFilter: PracticeTag | null, p: number) => {
    setLoading(true);
    setFailed(false);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (query) params.set('q', query);
      if (tagFilter) params.set('tag', tagFilter);
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
    void load(q, tag, page);
  }, [q, tag, page, load]);

  const chooseTag = (value: string) => {
    setPage(1);
    router.replace(value ? `${pathname}?tag=${encodeURIComponent(value)}` : pathname, { scroll: false });
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(input.trim());
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text-primary">Gallery</h1>
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
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="gallery-tag" className="text-sm text-text-primary">Tag</label>
        <select
          id="gallery-tag"
          value={tag ?? ''}
          onChange={(e) => chooseTag(e.target.value)}
          className="min-h-[44px] min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:max-w-xs sm:flex-none"
        >
          <option value="">All Tags</option>
          {PRACTICE_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {failed && <p role="alert" className="text-sm text-text-primary">Could not load Practices. Try again shortly.</p>}

      {!failed && !loading && practices.length === 0 && (
        <p className="text-sm text-text-primary">
          {q || tag ? 'No public Practices match.' : 'No public Practices yet.'}
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
                {p.thumbnail ? (
                  <PracticeThumbnail step={p.thumbnail} showMoves={false} className="h-full w-full" />
                ) : (
                  <div className="h-full w-full bg-primary" />
                )}
              </div>
              <div className="p-3">
                <h2 className="truncate text-sm font-medium text-text-primary">{p.title}</h2>
                <p className="text-xs text-text-primary">
                  {[
                    p.playerCount !== null && `${p.playerCount} ${p.playerCount === 1 ? 'player' : 'players'}`,
                    p.area && `${p.area.width} x ${p.area.length} m`,
                    `${p.progressionCount} ${p.progressionCount === 1 ? 'Progression' : 'Progressions'}`,
                  ]
                    .filter(Boolean)
                    .join(' \u00b7 ')}
                </p>
                {p.coachName && <p className="truncate text-xs text-text-primary">By {p.coachName}</p>}
                {(p.tags.length > 0 || p.hasSource) && (
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <li key={t} className="border border-[var(--color-border)] px-1.5 py-0.5 text-xs text-text-primary">
                        {t}
                      </li>
                    ))}
                    {p.hasSource && (
                      <li className="border border-[var(--color-border)] px-1.5 py-0.5 text-xs font-medium text-text-primary">
                        Source
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setReportingId(p.id)}
              className="mt-1 min-h-[44px] px-2 text-xs text-text-primary underline"
            >
              Report
            </button>
          </li>
        ))}
      </ul>

      {reportingId && <ReportPracticeDialog practiceId={reportingId} onClose={() => setReportingId(null)} />}

      {loading && <p role="status" className="mt-4 text-sm text-text-primary">Loading...</p>}
      {hasMore && !loading && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setPage((n) => n + 1)}>Load more</Button>
        </div>
      )}
    </main>
  );
}
