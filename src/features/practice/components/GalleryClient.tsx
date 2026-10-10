'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { ReportPracticeDialog } from './ReportPracticeDialog';
import { GalleryCardPreview } from './GalleryCardPreview';
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
  /** The one card whose preview is playing. */
  const [playingId, setPlayingId] = useState<string | null>(null);

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

  const clearFilters = () => {
    setInput('');
    setQ('');
    setPage(1);
    if (tag) router.replace(pathname, { scroll: false });
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(input.trim());
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-4xl text-text-primary">Gallery</h1>
      <form onSubmit={search} className="mb-6 flex gap-2" role="search">
        <input
          type="search"
          aria-label="Search by title"
          placeholder="Search by title"
          maxLength={100}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[44px] min-w-0 flex-1 border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="submit" className="min-h-[44px]">Search</Button>
      </form>
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="gallery-tag" className="text-sm text-text-primary">Tag</label>
        <select
          id="gallery-tag"
          value={tag ?? ''}
          onChange={(e) => chooseTag(e.target.value)}
          className="min-h-[44px] min-w-0 flex-1 border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:max-w-xs sm:flex-none"
        >
          <option value="">All Tags</option>
          {PRACTICE_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {failed && <p role="alert" className="text-sm text-text-primary">Could not load Practices. Try again shortly.</p>}

      {!failed && !loading && practices.length === 0 && (
        q || tag ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-text-primary">No Practices match that search.</p>
            <Button variant="outline" className="min-h-[44px]" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <p className="text-sm text-text-primary">No public Practices yet.</p>
        )
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {practices.map((p) => (
          <li key={p.id}>
            <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-border)] motion-reduce:transition-none">
              {p.thumbnail ? (
                <GalleryCardPreview
                  step={p.thumbnail}
                  title={p.title}
                  playing={playingId === p.id}
                  onPlayingChange={(on) => setPlayingId((cur) => (on ? p.id : cur === p.id ? null : cur))}
                  onOpen={() => router.push(`/p/${p.id}`)}
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-[#1A3D1A]" />
              )}
              <Link
                href={`/p/${p.id}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="p-3">
                  <h2 className="truncate font-heading text-base font-bold text-text-primary">{p.title}</h2>
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
                        <li key={t} className="border border-dashed border-[var(--color-border)] px-1.5 py-0.5 text-xs text-text-primary">
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
            </div>
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
