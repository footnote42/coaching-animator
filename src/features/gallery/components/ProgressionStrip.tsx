'use client';

import React, { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { MiniPitchSVG } from './MiniPitchSVG';

interface ProgressionPreview {
  id: string;
  title: string;
  progression_order: number;
  preview_entities: Array<{ x: number; y: number; team: 'attack' | 'defense' | 'neutral' }> | null;
}

interface ProgressionStripProps {
  parentId: string;
  progressionCount: number;
}

/**
 * ProgressionStrip
 *
 * Always-visible compact horizontal strip beneath a parent gallery card.
 * Fetches public progression children from /api/gallery/[id]/progressions.
 * Each item shows a MiniPitchSVG with a numbered stamp overlay.
 * Touch-swipeable (CSS scroll snap) and keyboard-navigable.
 */
export function ProgressionStrip({ parentId, progressionCount }: ProgressionStripProps) {
  const [progressions, setProgressions] = useState<ProgressionPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (progressionCount === 0) return;

    setLoading(true);
    fetch(`/api/gallery/${parentId}/progressions`)
      .then((res) => res.json())
      .then((data: { progressions: ProgressionPreview[] }) => {
        setProgressions(data.progressions ?? []);
      })
      .catch(() => {
        // Silently fail — strip simply won't render
        setProgressions([]);
      })
      .finally(() => setLoading(false));
  }, [parentId, progressionCount]);

  // Nothing to show
  if (progressionCount === 0) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      itemRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      itemRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      className="px-2 pb-2 pt-1 border-t border-border bg-surface-warm"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-[10px] tracking-widest font-medium uppercase text-text-primary/50 mb-1">
        Progressions
      </p>

      {loading ? (
        // Skeleton placeholders
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-none w-16 aspect-square bg-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          role="list"
          className="flex overflow-x-auto gap-2 snap-x snap-mandatory py-0.5"
          style={{ scrollbarWidth: 'none' }}
        >
          {progressions.map((p, index) => (
            <a
              key={p.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              role="listitem"
              href={`/share/${p.id}`}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="snap-start flex-none w-16 aspect-square relative block border border-border hover:border-primary transition-colors"
              aria-label={`Progression ${p.progression_order}: ${p.title}`}
            >
              <MiniPitchSVG
                entities={p.preview_entities ?? null}
                className="w-full h-full"
              />
              {/* Numbered stamp overlay */}
              <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-primary text-text-inverse text-[9px] font-bold flex items-center justify-center leading-none">
                {p.progression_order}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
