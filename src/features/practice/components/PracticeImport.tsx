'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  validate,
  resolveStep,
  positionsAt,
  formatError,
  stepCount,
  type ResolvedStep,
} from '@/features/practice/engine';
import { PracticeLibrary } from '@/features/practice/components/PracticeLibrary';
import type { PracticeScript } from '@/features/practice/schema';
import example from '@/features/practice/examples/passing-square-progressions.json';

const PracticeCanvas = dynamic(() => import('@/features/practice/components/PracticeCanvas'), {
  ssr: false,
});

const LEVER_NAMES = { space: 'Space', time: 'Time', equipment: 'Equipment', people: 'People' } as const;

/**
 * "Import script" box: paste a Practice Script, load it, and play it on the canvas.
 * A Step strip picks the base or a Progression; Commentary shows over the canvas.
 */
export function PracticeImport() {
  const router = useRouter();
  const openId = useSearchParams().get('id');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [script, setScript] = useState<PracticeScript | null>(null);
  const [step, setStep] = useState<ResolvedStep | null>(null);
  const [showCommentary, setShowCommentary] = useState(true);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const duration = step ? positionsAt(step, 0).duration : 0;
  const lastFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = lastFrame.current === null ? 0 : (now - lastFrame.current) / 1000;
      lastFrame.current = now;
      setTime((t) => Math.min(t + dt, duration));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastFrame.current = null;
    };
  }, [playing, duration]);

  useEffect(() => {
    if (playing && time >= duration) setPlaying(false);
  }, [playing, time, duration]);

  const playStep = (source: PracticeScript, n: number) => {
    setStep(resolveStep(source, n));
    setTime(0);
    setPlaying(true);
  };

  const loadText = (source: string) => {
    const result = validate(source);
    if (!result.ok) {
      setErrors(result.errors.map(formatError));
      return;
    }
    setErrors([]);
    setScript(result.script);
    playStep(result.script, 0);
  };

  const load = () => loadText(text);

  useEffect(() => {
    if (!openId) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/practices/${openId}`);
      if (cancelled) return;
      if (!res.ok) {
        setErrors(['This Practice could not be found.']);
        return;
      }
      const { practice } = await res.json();
      const source = JSON.stringify(practice.script, null, 2);
      setText(source);
      loadText(source);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const restart = () => {
    setTime(0);
    setPlaying(true);
  };

  return (
    <div className="flex h-[100dvh] flex-col gap-4 p-4 md:flex-row">
      <section className="flex flex-col gap-3 md:w-96 md:shrink-0">
        <h1 className="text-xl font-heading font-bold text-text-primary">Import script</h1>
        <label htmlFor="practice-script" className="text-sm text-text-primary">
          Paste a Practice Script (JSON).
        </label>
        <textarea
          id="practice-script"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="min-h-48 flex-1 resize-none border border-[var(--color-border)] bg-[var(--color-surface)] p-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={load} disabled={!text.trim()}>Load</Button>
          <Button variant="outline" onClick={() => setText(JSON.stringify(example, null, 2))}>
            Use example
          </Button>
        </div>
        <PracticeLibrary scriptText={text} onOpen={(id) => router.push(`/practice?id=${id}`)} />
        {errors.length > 0 && (
          <div role="alert" className="border border-destructive p-2 text-sm">
            <p className="mb-1 font-medium text-destructive">This script can&apos;t be loaded:</p>
            <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex min-h-64 flex-1 flex-col gap-2">
        {script && step && (
          <div role="group" aria-label="Steps" className="flex flex-wrap gap-2">
            {Array.from({ length: stepCount(script) }, (_, n) => {
              const lever = n > 0 ? script.progressions[n - 1].lever : undefined;
              return (
                <Button
                  key={n}
                  size="sm"
                  variant={n === step.index ? 'default' : 'outline'}
                  aria-pressed={n === step.index}
                  onClick={() => playStep(script, n)}
                >
                  {lever ? `${n}. ${LEVER_NAMES[lever]}` : 'Base'}
                </Button>
              );
            })}
          </div>
        )}
        <div className="relative min-h-0 flex-1">
          {step ? (
            <>
              <PracticeCanvas step={step} time={time} />
              {showCommentary && (step.lever || step.commentary.points.length > 0) && (
                <div
                  aria-live="polite"
                  className="pointer-events-none absolute left-2 top-2 max-w-xs bg-black/70 p-2 text-sm text-white"
                >
                  <p className="font-medium">
                    {step.lever ? `Step ${step.index}: ${LEVER_NAMES[step.lever]} lever` : 'Base Step'}
                  </p>
                  {step.commentary.points.length > 0 && (
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {step.commentary.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-[var(--color-border)] text-sm text-text-primary">
              Load a script to see it here.
            </div>
          )}
        </div>
        {step && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={() => (time >= duration ? restart() : setPlaying((p) => !p))}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button variant="outline" size="icon" aria-label="Restart" onClick={restart}>
              <RotateCcw />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
              aria-pressed={showCommentary}
              onClick={() => setShowCommentary((v) => !v)}
            >
              <MessageSquare />
            </Button>
            <span className="font-mono text-xs text-text-primary">
              {time.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
