'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { positionsAt, type ResolvedStep } from '@/features/practice/engine';
import { previewTime } from '@/features/practice/preview';
import { PracticeThumbnail } from './PracticeThumbnail';

interface GalleryCardPreviewProps {
  step: ResolvedStep;
  title: string;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  /** Mouse click opens the Practice; touch and keyboard toggle the preview instead. */
  onOpen: () => void;
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** True when the viewer has asked their device for less motion. */
function usePrefersReducedMotion(): boolean {
  // Cards only render after the Gallery loads in the browser, so reading it up front is safe.
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(REDUCED_MOTION);
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * A Gallery card's thumbnail. Hover (mouse) or tap (touch) plays the base Step
 * on a loop; leaving or a second tap stops it. The loop only runs while the
 * card is on screen, and never when the viewer prefers reduced motion.
 */
export function GalleryCardPreview({ step, title, playing, onPlayingChange, onOpen }: GalleryCardPreviewProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const lastPointer = useRef('mouse');
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const [playTime, setPlayTime] = useState(0);
  const duration = useMemo(() => positionsAt(step, 0).duration, [step]);
  const active = playing && visible && !reduced;
  const time = active ? playTime : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A card that scrolls away gives up the preview so another can take it.
  useEffect(() => {
    if (playing && !visible) onPlayingChange(false);
  }, [playing, visible, onPlayingChange]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;
      setPlayTime(previewTime((now - startedAt) / 1000, duration));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration]);

  const isMouse = (e: React.PointerEvent) => e.pointerType === 'mouse';

  return (
    <button
      ref={ref}
      type="button"
      aria-label={`${title}: ${playing ? 'stop' : 'play'} preview`}
      aria-pressed={playing}
      onPointerEnter={(e) => {
        if (isMouse(e)) onPlayingChange(true);
      }}
      onPointerLeave={(e) => {
        if (isMouse(e)) onPlayingChange(false);
      }}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      onClick={() => {
        if (lastPointer.current === 'mouse') onOpen();
        else onPlayingChange(!playing);
        lastPointer.current = 'keyboard';
      }}
      className="block aspect-[4/3] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <PracticeThumbnail step={step} showMoves={false} showLabels={false} time={time} className="h-full w-full" />
    </button>
  );
}
