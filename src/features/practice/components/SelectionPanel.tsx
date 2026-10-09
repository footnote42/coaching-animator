'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CONE_OUTLINE, markerColour } from '@/features/practice/markerColour';
import { BALL_CARRIER_KINDS, CONE_COLOURS, LYING_KINDS, MAX_BALLS, PACES, type MarkerKind, type Pace } from '@/features/practice/schema';
import type { ResolvedMarker } from '@/features/practice/engine';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { cn } from '@/lib/utils';

export const PACE_NAMES: Record<Pace, string> = { walk: 'Walk', jog: 'Jog', sprint: 'Sprint' };

const KIND_NAMES: Record<MarkerKind, string> = {
  attacker: 'Attacker',
  defender: 'Defender',
  ball: 'Ball',
  cone: 'Cone',
  'tackle-shield': 'Tackle shield',
  'tackle-bag': 'Tackle bag',
  coach: 'Coach',
};

const SELECT = 'h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

/** "Attacker 1", "Cone · red", "Ball 2": what the Coach has selected, in words. */
function markerName(marker: ResolvedMarker, balls: ResolvedMarker[]): string {
  const kind = KIND_NAMES[marker.kind];
  if (marker.kind === 'cone') return `${kind} · ${marker.colour ?? 'yellow'}`;
  if (marker.kind === 'ball') return balls.length > 1 ? `${kind} ${balls.findIndex((b) => b.id === marker.id) + 1}` : kind;
  return marker.label ? `${kind} ${marker.label}` : kind;
}

/**
 * The panel between the toolbar and the canvas. Its height never changes, so
 * selecting a marker never moves the canvas under the Coach's finger. It shows,
 * in order of priority: a pick in progress (catch, Release, Collect), the
 * selected marker's controls, or the hint for the current tool.
 */
export function SelectionPanel({ workspace, hint }: { workspace: EditorWorkspace; hint: string }) {
  const {
    editing,
    playing,
    selectedMarker,
    selectedMove,
    selection,
    balls,
    passes,
    carriedBall,
    tool,
    passKind,
    startPass,
    edit,
    deleteSelection,
    catchPass,
    endCatch,
    releasePass,
    endRelease,
    collectBall,
    endCollect,
  } = workspace;
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  useEffect(() => {
    setLabelDraft(null);
  }, [selectedMarker?.id]);

  let body: ReactNode;
  if (!editing) {
    body = (
      <p aria-live="polite" className="text-sm text-text-primary">
        {playing ? 'Playing.' : 'Paused.'} Press Back to start to edit this Step.
      </p>
    );
  } else if (catchPass || releasePass || collectBall) {
    const [text, action, onAction] = catchPass
      ? ['Tap the Run where it is caught.', 'End of run', endCatch]
      : releasePass
        ? ['Tap the passer’s Run where the ball is released.', 'Cancel', endRelease]
        : ['Tap the player who Collects the loose ball. Their Run goes to it.', 'Cancel', endCollect];
    body = (
      <div className="flex flex-wrap items-center gap-2">
        <p aria-live="polite" className="text-sm font-medium text-text-primary">{text}</p>
        <Button type="button" variant="outline" className="h-11 min-w-11 px-3" onClick={onAction}>
          {action}
        </Button>
      </div>
    );
  } else if (selectedMarker) {
    body = markerControls();
  } else {
    body = (
      <p aria-live="polite" className="text-sm text-text-primary">
        {hint}
      </p>
    );
  }

  function markerControls() {
    const marker = selectedMarker!;
    const heldBall = balls.find((b) => b.holder === marker.id);
    const canGiveBall =
      !heldBall && balls.length > 0 && balls.length < MAX_BALLS && (BALL_CARRIER_KINDS as readonly string[]).includes(marker.kind);
    const passesOn = !carriedBall && passes.some((p) => p.from === marker.id);
    const next =
      tool === 'run'
        ? 'Tap cells to extend the run, or a waypoint to set its Pace.'
        : tool === 'pass'
          ? passKind === 'kick'
            ? 'Tap the player to kick to, or the ground to kick to space.'
            : 'Tap the player receiving.'
          : undefined;
    const waypoint = selection.waypoint !== null && selectedMove?.waypoints[selection.waypoint] ? selection.waypoint : null;

    return (
      <div className="flex flex-col gap-1">
        <p className="flex min-w-0 items-baseline gap-2 text-sm">
          <span className="shrink-0 font-medium text-text-primary">
            {markerName(marker, balls)}
            {waypoint !== null && ` · point ${waypoint + 1}`}
          </span>
          {next && <span aria-live="polite" className="truncate text-xs text-text-muted" title={next}>{next}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-text-primary">
          <label htmlFor="marker-label" className="sr-only">Label</label>
          <input
            id="marker-label"
            type="text"
            placeholder={marker.id}
            value={labelDraft ?? marker.label ?? ''}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={() => {
              if (labelDraft !== null && labelDraft !== (marker.label ?? '')) {
                edit({ type: 'setLabel', marker: marker.id, label: labelDraft });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            maxLength={4}
            title="Label"
            className="h-11 w-14 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-center text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {marker.kind === 'cone' && (
            <div role="group" aria-label="Cone colour" className="flex items-center">
              {CONE_COLOURS.map((colour) => {
                const current = (marker.colour ?? 'yellow') === colour;
                const name = `${colour[0].toUpperCase()}${colour.slice(1)} cone`;
                return (
                  <button
                    key={colour}
                    type="button"
                    aria-label={name}
                    title={name}
                    aria-pressed={current}
                    onClick={() => edit({ type: 'setColour', marker: marker.id, colour })}
                    className="flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <span
                      className={cn('inline-block h-6 w-6 rounded-full border-2', current && 'ring-2 ring-offset-1 ring-black')}
                      style={{ backgroundColor: markerColour({ kind: 'cone', colour }), borderColor: CONE_OUTLINE }}
                    />
                  </button>
                );
              })}
            </div>
          )}
          {(LYING_KINDS as readonly string[]).includes(marker.kind) && (
            <Button
              type="button"
              variant={marker.lying ? 'default' : 'outline'}
              className="h-11"
              aria-pressed={!!marker.lying}
              title="Lay flat on the ground for this Step"
              onClick={() => edit({ type: 'setLying', marker: marker.id, lying: !marker.lying })}
            >
              Lying
            </Button>
          )}
          {selectedMove ? (
            <>
              <label htmlFor="run-pace" className="pl-1">Pace</label>
              <select
                id="run-pace"
                value={selectedMove.pace ?? 'jog'}
                onChange={(e) => edit({ type: 'setPace', marker: selectedMove.marker, pace: e.target.value as Pace })}
                className={SELECT}
              >
                {PACES.map((pace) => (
                  <option key={pace} value={pace}>{PACE_NAMES[pace]}</option>
                ))}
              </select>
              {waypoint !== null && (
                <>
                  <label htmlFor="segment-pace" className="pl-1">Into point {waypoint + 1}</label>
                  <select
                    id="segment-pace"
                    title="Pace of the run into this point"
                    value={selectedMove.waypoints[waypoint].pace ?? ''}
                    onChange={(e) =>
                      edit({
                        type: 'setWaypointPace',
                        marker: selectedMove.marker,
                        index: waypoint,
                        pace: e.target.value === '' ? null : (e.target.value as Pace),
                      })
                    }
                    className={SELECT}
                  >
                    <option value="">Run Pace</option>
                    {PACES.map((pace) => (
                      <option key={pace} value={pace}>{PACE_NAMES[pace]}</option>
                    ))}
                  </select>
                </>
              )}
              <Button variant="outline" className="h-11" onClick={() => edit({ type: 'removeMove', marker: selectedMove.marker })}>
                Delete run
              </Button>
            </>
          ) : marker.kind === 'ball' ? (
            <span className="text-xs">
              {marker.holder ? 'Drag the player to move the ball.' : 'Lying loose. Drag it onto a player to give it to them, or use Collect to send a player to it.'}
            </span>
          ) : (
            (BALL_CARRIER_KINDS as readonly string[]).includes(marker.kind) && <span className="text-xs">No run yet: use Draw a run.</span>
          )}
          {heldBall && (
            <Button variant="outline" className="h-11" onClick={() => edit({ type: 'removeMarker', marker: heldBall.id })}>
              Remove ball
            </Button>
          )}
          {canGiveBall && (
            <Button variant="outline" className="h-11" onClick={() => edit({ type: 'addBall', holder: marker.id })}>
              Give a ball
            </Button>
          )}
          {carriedBall && (
            <div role="group" aria-label="Ball carrier" className="flex items-center gap-1">
              {(['pass', 'kick'] as const).map((kind) => {
                const on = tool === 'pass' && passKind === kind;
                return (
                  <Button key={kind} variant={on ? 'default' : 'outline'} className="h-11" aria-pressed={on} onClick={() => startPass(kind, carriedBall)}>
                    {kind === 'pass' ? 'Pass' : 'Kick'}
                  </Button>
                );
              })}
            </div>
          )}
          {passesOn && <span className="text-xs">Their passes are under Passing and kicking.</span>}
          <Button
            variant="outline"
            className="h-11 min-w-11 px-2"
            aria-label={selection.waypoint !== null ? 'Delete waypoint' : 'Delete marker'}
            title={selection.waypoint !== null ? 'Delete waypoint' : 'Delete marker'}
            onClick={deleteSelection}
          >
            <Trash2 /> <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Selection"
      className="h-44 shrink-0 overflow-y-auto overscroll-contain border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 md:h-32"
    >
      {body}
    </div>
  );
}
