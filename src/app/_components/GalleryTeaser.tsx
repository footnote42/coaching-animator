'use client';

import { useEffect, useState } from 'react';
import type { ResolvedStep } from '@/features/practice/engine';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';

interface TeaserPractice {
  id: string;
  title: string;
  coachName: string | null;
  thumbnail: ResolvedStep | null;
}

/** The three newest public Practices. Shows nothing but a prompt if the Gallery cannot be reached or is empty. */
export default function GalleryTeaser() {
  const [practices, setPractices] = useState<TeaserPractice[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/practices/public')
      .then((res) => (res.ok ? res.json() : { practices: [] }))
      .then((body: { practices?: TeaserPractice[] }) => {
        if (cancelled) return;
        setPractices((body.practices ?? []).filter((p) => p.thumbnail).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setPractices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (practices === null) {
    return <div className="min-h-[12rem]" aria-hidden="true" />;
  }
  if (practices.length === 0) {
    return <p className="font-hand text-3xl text-[color:var(--landing-pencil)]">Practices shared by coaches appear here.</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {practices.map((p) => (
        <li key={p.id} className="border-2 border-border bg-surface transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--line)]">
          <a href={`/p/${p.id}`} className="block min-h-[44px]">
            <PracticeThumbnail step={p.thumbnail!} showMoves={false} className="block aspect-[4/3] w-full border-b-2 border-border" />
            <span className="block px-4 py-3">
              <span className="block font-heading text-xl font-extrabold leading-tight text-text-primary">{p.title}</span>
              {p.coachName && <span className="block text-sm text-text-primary/70">by {p.coachName}</span>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
