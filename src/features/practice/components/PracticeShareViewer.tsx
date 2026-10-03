'use client';

import React, { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ListVideo, MessageSquare, Flag, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { positionsAt, resolveStep, stepCount, type ResolvedStep } from '@/features/practice/engine';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';
import { ReportPracticeDialog } from '@/features/practice/components/ReportPracticeDialog';
import type { PracticeScript } from '@/features/practice/schema';

const LEVER_NAMES = { space: 'Space', time: 'Time', equipment: 'Equipment', people: 'People' } as const;

export const PLAYBACK_SPEEDS = [
  { value: 0.5, label: '½×', name: 'Half speed' },
  { value: 1, label: '1×', name: 'Normal speed' },
  { value: 2, label: '2×', name: 'Double speed' },
] as const;

/** Seconds "play all" rests on a finished Step before moving to the next. */
const PLAY_ALL_HOLD_S = 1.5;

/** Every control is at least 44px square. */
const CONTROL = 'h-11 min-w-11 px-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white';
const CONTROL_ON = 'bg-white text-black hover:bg-white/90 hover:text-black';

type CanvasComponent = ComponentType<{ step: ResolvedStep; time: number }>;

interface PracticeShareViewerProps {
  /** Practice id; when set, the header shows a Report button. */
  practiceId?: string;
  title: string;
  /** A validated Practice Script. */
  script: PracticeScript;
}

/**
 * Full-screen, no-scroll viewer for a shared Practice at /p/[id]. Opens on
 * Step 0 with previous/next Step, play/pause, "play all", speed and a
 * Commentary toggle. Shows a static thumbnail until the canvas has loaded.
 */
export function PracticeShareViewer({ practiceId, title, script }: PracticeShareViewerProps) {
  const [reporting, setReporting] = useState(false);
  const steps = stepCount(script);
  const [stepIndex, setStepIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showCommentary, setShowCommentary] = useState(true);
  const [Canvas, setCanvas] = useState<CanvasComponent | null>(null);
  const lastFrame = useRef<number | null>(null);

  const step = useMemo(() => resolveStep(script, stepIndex), [script, stepIndex]);
  const duration = useMemo(() => positionsAt(step, 0).duration, [step]);
  const end = duration + (playAll && stepIndex < steps - 1 ? PLAY_ALL_HOLD_S : 0);

  // Konva needs the browser: load it after mount, then start Step 0 playing.
  useEffect(() => {
    let cancelled = false;
    void import('@/features/practice/components/PracticeCanvas').then((m) => {
      if (cancelled) return;
      setCanvas(() => m.default);
      setPlaying(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = lastFrame.current === null ? 0 : (now - lastFrame.current) / 1000;
      lastFrame.current = now;
      setTime((t) => Math.min(t + dt * speed, end));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastFrame.current = null;
    };
  }, [playing, speed, end]);

  useEffect(() => {
    if (!playing || time < end) return;
    if (playAll && stepIndex < steps - 1) {
      setStepIndex(stepIndex + 1);
      setTime(0);
    } else {
      setPlaying(false);
      setPlayAll(false);
    }
  }, [playing, playAll, time, end, stepIndex, steps]);

  const goTo = (n: number) => {
    setStepIndex(n);
    setTime(0);
    setPlayAll(false);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (time >= end) setTime(0);
    setPlaying(true);
  };

  const togglePlayAll = () => {
    if (playAll) return setPlayAll(false);
    setStepIndex(0);
    setTime(0);
    setPlayAll(true);
    setPlaying(true);
  };

  /** Copy the Practice Script, e.g. to adapt it in Import script or hand it to an AI. */
  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(script, null, 2));
      toast.success('Script copied.');
    } catch {
      toast.error("Couldn't copy the script.");
    }
  };

  const hasCommentary = Boolean(step.lever) || step.commentary.points.length > 0;
  const stepLabel = step.lever ? `Step ${step.index}: ${LEVER_NAMES[step.lever]} lever` : 'Base Step';

  return (
    <div style={{ position: 'fixed', inset: 0 }} className="z-50 flex flex-col overflow-hidden bg-black text-white">
      <header className="flex min-h-11 items-center gap-3 px-3 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <h1 className="min-w-0 flex-1 truncate font-heading text-base font-bold md:text-lg">{title}</h1>
        <p className="shrink-0 text-xs text-white/75 md:text-sm" aria-live="polite">
          {stepLabel} ({stepIndex + 1}/{steps})
        </p>
        <Button variant="outline" className={CONTROL} aria-label="Copy script" title="Copy script" onClick={copyScript}>
          <Copy />
        </Button>
        {practiceId && (
          <Button variant="outline" className={CONTROL} aria-label="Report this Practice" onClick={() => setReporting(true)}>
            <Flag />
          </Button>
        )}
      </header>

      <main className="relative min-h-0 flex-1">
        {Canvas ? (
          <Canvas step={step} time={Math.min(time, duration)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PracticeThumbnail step={step} showMoves={false} className="h-full w-full" />
          </div>
        )}
        {showCommentary && hasCommentary && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute left-2 top-2 max-w-[calc(100%-1rem)] bg-black/75 p-2 text-sm text-white sm:max-w-sm"
          >
            <p className="font-medium">{stepLabel}</p>
            {step.commentary.points.length > 0 && (
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {step.commentary.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      <nav
        aria-label="Playback"
        className="flex flex-wrap items-center justify-center gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <Button
          variant="outline"
          className={CONTROL}
          aria-label="Previous Step"
          disabled={stepIndex === 0}
          onClick={() => goTo(stepIndex - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button variant="outline" className={CONTROL} aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay}>
          {playing ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="outline"
          className={CONTROL}
          aria-label="Next Step"
          disabled={stepIndex === steps - 1}
          onClick={() => goTo(stepIndex + 1)}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          className={`${CONTROL} ${playAll ? CONTROL_ON : ''}`}
          aria-pressed={playAll}
          onClick={togglePlayAll}
        >
          <ListVideo />
          <span>Play all</span>
        </Button>
        <Button
          variant="outline"
          className={`${CONTROL} ${showCommentary ? CONTROL_ON : ''}`}
          aria-label={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
          aria-pressed={showCommentary}
          onClick={() => setShowCommentary((v) => !v)}
        >
          <MessageSquare />
        </Button>
        <div role="group" aria-label="Speed" className="flex">
          {PLAYBACK_SPEEDS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className={`${CONTROL} ${speed === option.value ? CONTROL_ON : ''}`}
              aria-label={option.name}
              aria-pressed={speed === option.value}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </nav>
      {reporting && practiceId && <ReportPracticeDialog practiceId={practiceId} onClose={() => setReporting(false)} />}
    </div>
  );
}

export default PracticeShareViewer;
