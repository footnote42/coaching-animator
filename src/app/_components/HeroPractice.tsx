'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { positionsAt, type ResolvedStep } from '@/features/practice/engine';
import { previewTime } from '@/features/practice/preview';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * The hero's Practice, taped to the page and playing on a loop. Under reduced
 * motion, or while off screen, it rests on the finished frame instead.
 */
export default function HeroPractice({ step, title }: { step: ResolvedStep; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const duration = useMemo(() => positionsAt(step, 0).duration, [step]);
  // Server and first render assume reduced motion (the resting frame), then follow the real setting.
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const [visible, setVisible] = useState(true);
  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const active = !reduced && visible;
  // At rest (reduced motion or off screen) show the finished frame.
  const time = active ? playTime : duration;
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

  return (
    <div ref={ref}>
      <PracticeThumbnail
        step={step}
        time={time}
        title={`Animated example: ${title}. Three attackers pass the ball wide past two defenders.`}
        className="block h-auto w-full"
      />
      <p className="mt-2 flex justify-between gap-2 text-sm text-text-primary/70 tabular-nums">
        <span>
          <strong className="text-text-primary">{title}</strong> &middot; {step.area.width} x {step.area.length} m
        </span>
        <span aria-hidden="true">{time.toFixed(1)} s</span>
      </p>
    </div>
  );
}
