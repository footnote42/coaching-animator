'use client';

import { currentWait, waitOptions, type WaitSubject } from '@/features/practice/editing';
import type { ResolvedStep } from '@/features/practice/engine';
import type { PracticeScript, Wait } from '@/features/practice/schema';
import { cn } from '@/lib/utils';

const SELECT =
  'h-11 w-full min-w-0 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

/** A wait as a select value: `move:a1`, `pass:p1` or `reach:a1:2`; empty for none. */
export function waitKey(wait: Wait | undefined): string {
  if (!wait) return '';
  if (wait.move !== undefined) return `move:${wait.move}`;
  if (wait.pass !== undefined) return `pass:${wait.pass}`;
  if (wait.reach !== undefined) return `reach:${wait.reach.marker}:${wait.reach.waypoint}`;
  return '';
}

/** The wait a select value stands for, or null for none. */
export function parseWaitKey(key: string): Wait | null {
  const [kind, id, point] = key.split(':');
  if (kind === 'move') return { move: id };
  if (kind === 'pass') return { pass: id };
  if (kind === 'reach') return { reach: { marker: id, waypoint: Number(point) } };
  return null;
}

/** An option's text; reach counts points from 1 (the script counts from 0). */
export function waitLabel(wait: Wait, name: (id: string) => string, passName: (id: string) => string): string {
  if (wait.move !== undefined) return `When ${name(wait.move)} arrives`;
  if (wait.pass !== undefined) return `When ${passName(wait.pass)} is caught`;
  if (wait.reach !== undefined) return `When ${name(wait.reach.marker)} reaches point ${wait.reach.waypoint + 1}`;
  return '';
}

/**
 * The wait choices for a run's start, a pass or a waypoint's hold: the current one, then every
 * other wait that would not make waits loop.
 */
export function WaitPicker({
  id,
  ariaLabel,
  script,
  step,
  subject,
  kinds,
  none,
  onChange,
  className,
}: {
  id: string;
  ariaLabel: string;
  script: PracticeScript;
  step: ResolvedStep;
  subject: WaitSubject;
  kinds?: ReadonlyArray<'move' | 'pass' | 'reach'>;
  /** Text of the choice that waits for nothing. */
  none: string;
  onChange: (wait: Wait | null) => void;
  className?: string;
}) {
  const name = (marker: string) => script.markers.find((m) => m.id === marker)?.label ?? marker;
  const passName = (pass: string) => {
    const p = step.passes.find((x) => x.id === pass);
    return p ? `the pass from ${name(p.from)} to ${p.to === undefined ? 'space' : name(p.to)}` : `pass ${pass}`;
  };
  const current = currentWait(step, subject);
  const options = [...(current ? [current] : []), ...waitOptions(script, step, subject, kinds)];
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={waitKey(current)}
      onChange={(e) => onChange(parseWaitKey(e.target.value))}
      className={cn(SELECT, className)}
    >
      <option value="">{none}</option>
      {options.map((wait) => (
        <option key={waitKey(wait)} value={waitKey(wait)}>{waitLabel(wait, name, passName)}</option>
      ))}
    </select>
  );
}
