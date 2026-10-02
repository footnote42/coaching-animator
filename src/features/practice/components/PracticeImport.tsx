'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  validate,
  resolveStep,
  positionsAt,
  formatError,
  type ResolvedStep,
} from '@/features/practice/engine';
import passingSquare from '@/features/practice/examples/passing-square.json';

const PracticeCanvas = dynamic(() => import('@/features/practice/components/PracticeCanvas'), {
  ssr: false,
});

/**
 * "Import script" box: paste a Practice Script, load it, and play it on the canvas.
 */
export function PracticeImport() {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<ResolvedStep | null>(null);
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

  const load = () => {
    const result = validate(text);
    if (!result.ok) {
      setErrors(result.errors.map(formatError));
      return;
    }
    setErrors([]);
    setStep(resolveStep(result.script, 0));
    setTime(0);
    setPlaying(true);
  };

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
          <Button variant="outline" onClick={() => setText(JSON.stringify(passingSquare, null, 2))}>
            Use example
          </Button>
        </div>
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
        <div className="min-h-0 flex-1">
          {step ? (
            <PracticeCanvas step={step} time={time} />
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
            <span className="font-mono text-xs text-text-primary">
              {time.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
