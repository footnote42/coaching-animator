'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';

/** Toolbar-sized button: at least 44 px square for touch. */
const TOOL_BUTTON = 'h-11 min-w-11 px-2';
const ballSelect = 'h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm';

/** The Step's passes and kicks: pending picks, loose balls, each pass's settings and the Step warnings. */
export function PassList({ workspace }: { workspace: EditorWorkspace }) {
  const {
    editing,
    catchPass,
    endCatch,
    releasePass,
    startRelease,
    endRelease,
    collectBall,
    startCollect,
    endCollect,
    looseBalls,
    passes,
    balls,
    activeBall,
    setPassBall,
    tool,
    script,
    step,
    stepWarnings,
    edit,
  } = workspace;
  const ballName = (id: string) => `Ball ${balls.findIndex((b) => b.id === id) + 1}`;

  return (
    <>
    {editing && catchPass && (
      <>
        <span>Tap the Run where it is caught.</span>
        <Button type="button" variant="outline" className={TOOL_BUTTON} onClick={endCatch}>
          End of run
        </Button>
      </>
    )}

    {editing && !catchPass && releasePass && (
      <>
        <span>Tap the passer’s Run where the ball is released.</span>
        <Button type="button" variant="outline" className={TOOL_BUTTON} onClick={endRelease}>
          Cancel
        </Button>
      </>
    )}

    {editing && collectBall ? (
      <>
        <span>Tap the player who Collects the loose ball. Their Run goes to it.</span>
        <Button type="button" variant="outline" className={TOOL_BUTTON} onClick={endCollect}>
          Cancel
        </Button>
      </>
    ) : (
      editing &&
      !catchPass &&
      !releasePass &&
      looseBalls.length > 0 && (
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
      )
    )}

    {editing && tool === 'pass' && balls.length > 1 && (
      <>
        <label htmlFor="pass-ball">Ball for new passes</label>
        <select id="pass-ball" value={activeBall} onChange={(e) => setPassBall(e.target.value)} className={ballSelect}>
          {balls.map((b) => (
            <option key={b.id} value={b.id}>{ballName(b.id)}</option>
          ))}
        </select>
      </>
    )}

    {editing && passes.length > 0 && (
      <div role="group" aria-label="Passes" className="flex flex-wrap items-center gap-2">
        <span>Passes:</span>
        {passes.map((pass) => {
          const name = (id: string | undefined) => (id === undefined ? 'space' : script.markers.find((m) => m.id === id)?.label ?? id);
          const run = step?.moves.find((m) => m.marker === pass.to);
          const passerRun = step?.moves.find((m) => m.marker === pass.from);
          return (
            <span key={pass.id} className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-11"
                aria-label={`Delete pass ${name(pass.from)} to ${name(pass.to)}`}
                onClick={() => edit({ type: 'removePass', id: pass.id })}
              >
                {name(pass.from)} &rarr; {name(pass.to)} <Trash2 />
              </Button>
              {balls.length > 1 && (
                <select
                  aria-label={`Ball for pass ${name(pass.from)} to ${name(pass.to)}`}
                  value={pass.ball ?? balls[0].id}
                  onChange={(e) => edit({ type: 'setPassBall', id: pass.id, ball: e.target.value })}
                  className={ballSelect}
                >
                  {balls.map((b) => (
                    <option key={b.id} value={b.id}>{ballName(b.id)}</option>
                  ))}
                </select>
              )}
              <label className="flex h-11 items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={pass.kick ?? false}
                  disabled={pass.cell !== undefined}
                  onChange={(e) => edit({ type: 'setKick', id: pass.id, kick: e.target.checked })}
                />
                Kick
                <span className="sr-only"> {name(pass.from)} to {name(pass.to)}</span>
              </label>
              <select
                aria-label={`Pass ${name(pass.from)} to ${name(pass.to)} when this player arrives`}
                value={pass.after?.move ?? ''}
                onChange={(e) => edit({ type: 'setPassWait', id: pass.id, move: e.target.value === '' ? null : e.target.value })}
                className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
              >
                <option value="">Pass when no one arrives</option>
                {step?.moves.map((m) => (
                  <option key={m.marker} value={m.marker}>Pass when {name(m.marker)} arrives</option>
                ))}
              </select>
              {run && run.waypoints.length > 1 && (
                <select
                  aria-label={`Where ${name(pass.to)} catches`}
                  value={pass.at ?? ''}
                  onChange={(e) =>
                    edit({ type: 'setCatch', id: pass.id, at: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
                >
                  <option value="">Catch at end of run</option>
                  {run.waypoints.slice(0, -1).map((_, i) => (
                    <option key={i} value={i}>Catch at point {i + 1}, run on</option>
                  ))}
                </select>
              )}
              {passerRun && (
                <>
                  <select
                    aria-label={`Where ${name(pass.from)} releases`}
                    value={pass.release ?? ''}
                    onChange={(e) =>
                      edit({ type: 'setRelease', id: pass.id, release: e.target.value === '' ? null : Number(e.target.value) })
                    }
                    className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
                  >
                    <option value="">Release when ready</option>
                    {passerRun.waypoints.map((_, i) => (
                      <option key={i} value={i}>
                        {i === passerRun.waypoints.length - 1 ? 'Release at end of run' : `Release at point ${i + 1}, run on`}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    className="h-11"
                    aria-pressed={releasePass === pass.id}
                    onClick={() => (releasePass === pass.id ? endRelease() : startRelease(pass.id))}
                  >
                    Tap release
                    <span className="sr-only"> point for {name(pass.from)} to {name(pass.to)}</span>
                  </Button>
                </>
              )}
            </span>
          );
        })}
      </div>
    )}
    {editing && stepWarnings.length > 0 && (
      <ul role="status" className="border-l-4 border-[var(--color-accent-warm)] pl-2 text-sm text-text-primary">
        {stepWarnings.map((w) => (
          <li key={`${w.kind}-${w.pass}`} className="flex flex-wrap items-center gap-2">
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
    )}
    </>
  );
}
