'use client';

import { ArrowRight, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { WaitPicker } from '@/features/practice/components/WaitPicker';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { cn } from '@/lib/utils';

const SELECT =
  'h-11 w-full min-w-0 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

/**
 * Passing and kicking for the shown Step: warnings with their fixes, the ball
 * for new passes, Collect for each loose ball, and one card per pass with its
 * Kick, timing, catch and Release settings.
 */
export function PassList({ workspace }: { workspace: EditorWorkspace }) {
  const {
    editing,
    catchPass,
    releasePass,
    startRelease,
    endRelease,
    collectBall,
    startCollect,
    looseBalls,
    passes,
    balls,
    activeBall,
    setPassBall,
    script,
    step,
    stepWarnings,
    edit,
  } = workspace;
  const ballName = (id: string) => `Ball ${balls.findIndex((b) => b.id === id) + 1}`;
  const name = (id: string | undefined) => (id === undefined ? 'space' : script.markers.find((m) => m.id === id)?.label ?? id);

  if (!editing) {
    return <p className="text-sm text-text-primary">Press Back to start to change the passes.</p>;
  }

  return (
    <div className="flex flex-col gap-3 text-sm text-text-primary">
      {stepWarnings.length > 0 && (
        <div className="flex flex-col gap-2 border border-[var(--color-accent-warm)] bg-[var(--color-surface-warm)] p-2">
          <p className="flex items-center gap-1.5 font-medium">
            <TriangleAlert aria-hidden className="h-4 w-4 shrink-0 text-[var(--color-accent-warm)]" />
            Check {stepWarnings.length === 1 ? 'this pass' : 'these passes'}
          </p>
          <ul role="status" className="flex flex-col gap-2">
            {stepWarnings.map((w) => (
              <li key={`${w.kind}-${w.pass}`} className="flex flex-col items-start gap-1">
                {w.message}
                {w.fix && (
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => edit({ type: 'startAfterPass', marker: w.fix!.marker, pass: w.fix!.afterPass })}
                  >
                    Start the run after the pass
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {passes.length === 0 && (
        <p>
          No passes in this Step yet. Select the player with the ball and choose Pass or Kick, or use the Add a pass tool.
        </p>
      )}

      {balls.length > 1 && (
        <div className="flex items-center gap-2">
          <label htmlFor="pass-ball" className="shrink-0">Ball for new passes</label>
          <select id="pass-ball" value={activeBall} onChange={(e) => setPassBall(e.target.value)} className={SELECT}>
            {balls.map((b) => (
              <option key={b.id} value={b.id}>{ballName(b.id)}</option>
            ))}
          </select>
        </div>
      )}

      {!catchPass && !releasePass && !collectBall && looseBalls.length > 0 && (
        <div role="group" aria-label="Loose ball" className="flex flex-wrap items-center gap-2">
          {looseBalls.map((loose) => {
            const collector = passes.find((p) => p.id === loose.collect)?.from;
            const who = collector && (script.markers.find((m) => m.id === collector)?.label ?? collector);
            return (
              <Button key={loose.ball} type="button" variant="outline" className="h-11" onClick={() => startCollect(loose.ball)}>
                {balls.length > 1 ? `Collect ${ballName(loose.ball)}` : 'Collect'}
                {who ? ` (${who})` : ''}
              </Button>
            );
          })}
        </div>
      )}

      {passes.length > 0 && (
        <ol aria-label="Passes" className="flex flex-col gap-2">
          {passes.map((pass, index) => {
            const route = `${name(pass.from)} to ${name(pass.to)}`;
            const run = step?.moves.find((m) => m.marker === pass.to);
            const passerRun = step?.moves.find((m) => m.marker === pass.from);
            const warned = stepWarnings.some((w) => w.pass === pass.id);
            const field = (key: string) => `pass-${pass.id}-${key}`;
            return (
              <li
                key={pass.id}
                className={cn(
                  'flex flex-col gap-1.5 border bg-[var(--color-surface)] p-2',
                  warned ? 'border-[var(--color-accent-warm)]' : 'border-[var(--color-border)]',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="flex min-w-0 items-center gap-1 font-medium">
                    <span className="mr-1 text-xs font-normal text-text-muted">Pass {index + 1}</span>
                    {name(pass.from)}
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
                    <span className="sr-only">to</span>
                    {name(pass.to)}
                  </span>
                  <label className="flex h-11 items-center gap-1.5 px-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={pass.kick ?? false}
                      disabled={pass.cell !== undefined}
                      onChange={(e) => edit({ type: 'setKick', id: pass.id, kick: e.target.checked })}
                    />
                    Kick
                    <span className="sr-only"> {route}</span>
                  </label>
                  <Button
                    variant="outline"
                    className="ml-auto h-11 w-11 shrink-0 p-0"
                    aria-label={`Delete pass ${route}`}
                    title="Delete this pass"
                    onClick={() => edit({ type: 'removePass', id: pass.id })}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-2 gap-y-1">
                  {balls.length > 1 && (
                    <>
                      <label htmlFor={field('ball')}>Ball</label>
                      <select
                        id={field('ball')}
                        aria-label={`Ball for pass ${route}`}
                        value={pass.ball ?? balls[0].id}
                        onChange={(e) => edit({ type: 'setPassBall', id: pass.id, ball: e.target.value })}
                        className={SELECT}
                      >
                        {balls.map((b) => (
                          <option key={b.id} value={b.id}>{ballName(b.id)}</option>
                        ))}
                      </select>
                    </>
                  )}
                  <label htmlFor={field('when')}>Timing</label>
                  {step && (
                    <WaitPicker
                      id={field('when')}
                      ariaLabel={`Timing of pass ${route}: pass when`}
                      script={script}
                      step={step}
                      subject={{ pass: pass.id }}
                      kinds={['move', 'reach']}
                      none="Pass when ready"
                      onChange={(wait) => edit({ type: 'setPassAfter', id: pass.id, wait })}
                    />
                  )}
                  {run && run.waypoints.length > 1 && (
                    <>
                      <label htmlFor={field('catch')}>Catch</label>
                      <select
                        id={field('catch')}
                        aria-label={`Catch: where ${name(pass.to)} catches`}
                        value={pass.at ?? ''}
                        onChange={(e) => edit({ type: 'setCatch', id: pass.id, at: e.target.value === '' ? null : Number(e.target.value) })}
                        className={SELECT}
                      >
                        <option value="">At end of run</option>
                        {run.waypoints.slice(0, -1).map((_, i) => (
                          <option key={i} value={i}>At point {i + 1}, then run on</option>
                        ))}
                      </select>
                    </>
                  )}
                  {passerRun && (
                    <>
                      <label htmlFor={field('release')}>Release</label>
                      <div className="flex min-w-0 gap-1">
                        <select
                          id={field('release')}
                          aria-label={`Release: where ${name(pass.from)} releases`}
                          value={pass.release ?? ''}
                          onChange={(e) =>
                            edit({ type: 'setRelease', id: pass.id, release: e.target.value === '' ? null : Number(e.target.value) })
                          }
                          className={SELECT}
                        >
                          <option value="">When ready</option>
                          {passerRun.waypoints.map((_, i) => (
                            <option key={i} value={i}>
                              {i === passerRun.waypoints.length - 1 ? 'At end of run' : `At point ${i + 1}, then run on`}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant={releasePass === pass.id ? 'default' : 'outline'}
                          className="h-11 shrink-0 px-2"
                          aria-pressed={releasePass === pass.id}
                          title="Tap the passer’s Run where the ball is released"
                          onClick={() => (releasePass === pass.id ? endRelease() : startRelease(pass.id))}
                        >
                          Tap
                          <span className="sr-only"> release point for {route}</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
