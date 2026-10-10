'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { WaitPicker } from '@/features/practice/components/WaitPicker';
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

export interface ToolHelp {
  name: string;
  description: string;
}

export const TOOL_HELP: Record<string, ToolHelp> = {
  select: {
    name: 'Select',
    description: 'drag a marker to move it, or tap one to select it.',
  },
  run: {
    name: 'Run',
    description: 'tap a player, then tap cells to draw their run.',
  },
  pass: {
    name: 'Pass',
    description: 'tap the player with the ball, then the player receiving.',
  },
  kick: {
    name: 'Kick',
    description: 'tap the player to kick to, or the pitch to kick to space.',
  },
  attacker: {
    name: 'Attacker',
    description: 'tap the pitch to place a player.',
  },
  defender: {
    name: 'Defender',
    description: 'tap the pitch to place a defending player.',
  },
  ball: {
    name: 'Ball',
    description: 'tap a player to give them the ball, or the pitch to leave it loose.',
  },
  cone: {
    name: 'Cone',
    description: 'tap the pitch to place a cone.',
  },
  'tackle-shield': {
    name: 'Tackle shield',
    description: 'tap the pitch to place a tackle shield.',
  },
  'tackle-bag': {
    name: 'Tackle bag',
    description: 'tap the pitch to place a tackle bag.',
  },
  coach: {
    name: 'Coach',
    description: 'tap the pitch to place a coach.',
  },
  undo: {
    name: 'Undo',
    description: 'reverse the last edit.',
  },
  redo: {
    name: 'Redo',
    description: 'restore the last undone edit.',
  },
};

export function getToolHelp(tool: string, passKind?: 'pass' | 'kick'): ToolHelp {
  if (tool === 'pass' && passKind === 'kick') return TOOL_HELP.kick;
  return TOOL_HELP[tool] ?? { name: tool, description: '' };
}

/** "Attacker 1", "Cone · red", "Ball 2": what the Coach has selected, in words. */
function markerName(marker: ResolvedMarker, balls: ResolvedMarker[]): string {
  const kind = KIND_NAMES[marker.kind];
  if (marker.kind === 'cone') return `${kind} · ${marker.colour ?? 'yellow'}`;
  if (marker.kind === 'ball') return balls.length > 1 ? `${kind} ${balls.findIndex((b) => b.id === marker.id) + 1}` : kind;
  return marker.label ? `${kind} ${marker.label}` : kind;
}

/**
 * The panel between the toolbar and the canvas. Its height never changes for a
 * given state, so selecting a marker never moves the canvas under the Coach's
 * finger. On a phone it is one line (the controls scroll sideways) until the
 * Coach expands it, so the canvas starts higher. It shows, in order of priority:
 * a pick in progress (catch, Release, Collect), the selected marker's controls,
 * or the hint for the current tool.
 */
export function SelectionPanel({
  workspace,
  hint,
  preview,
}: {
  workspace: EditorWorkspace;
  hint?: string;
  preview?: string | null;
}) {
  const {
    editing,
    playing,
    shownStep,
    selectedMarker,
    selectedMove,
    script,
    step,
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
  // Phone only: from md up the panel is always full size and the toggle is hidden.
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  useEffect(() => {
    setLabelDraft(null);
  }, [selectedMarker?.id]);

  let body: ReactNode;
  if (preview) {
    const previewHelp = getToolHelp(preview, passKind);
    body = (
      <p aria-live="polite" className="text-sm text-text-primary">
        <span className="font-semibold text-text-primary">{previewHelp.name}:</span> {previewHelp.description}
      </p>
    );
  } else if (!editing) {
    body = (
      <p aria-live="polite" className={cn('text-sm text-text-primary', !expanded && 'truncate md:whitespace-normal')}>
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
      <div className={cn('flex items-center gap-2', expanded ? 'flex-wrap' : 'flex-nowrap md:flex-wrap')}>
        <p aria-live="polite" className={cn('text-sm font-medium text-text-primary', !expanded && 'truncate md:whitespace-normal')}>{text}</p>
        <Button type="button" variant="outline" className="h-11 min-w-11 shrink-0 px-3" onClick={onAction}>
          {action}
        </Button>
      </div>
    );
  } else if (selectedMarker) {
    body = markerControls();
  } else {
    const activeHelp = getToolHelp(tool, passKind);
    const stepNote = shownStep > 0 ? ` Edits here change Step ${shownStep} and the Steps after it.` : '';
    body = (
      <p aria-live="polite" className={cn('text-sm text-text-primary', !expanded && 'truncate md:whitespace-normal')}>
        {hint ? (
          hint
        ) : (
          <>
            <span className="font-semibold text-text-primary">{activeHelp.name}:</span> {activeHelp.description}
            {stepNote}
          </>
        )}
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
      <div className={cn('flex gap-1', expanded ? 'flex-col' : 'flex-row items-center md:flex-col md:items-stretch')}>
        <p className="flex min-w-0 shrink-0 items-baseline gap-2 text-sm md:shrink">
          <span className="shrink-0 font-medium text-text-primary">
            {markerName(marker, balls)}
            {waypoint !== null && ` · point ${waypoint + 1}`}
          </span>
          {next && <span aria-live="polite" className={cn('truncate text-xs text-text-muted', !expanded && 'hidden md:inline')} title={next}>{next}</span>}
        </p>
        <div className={cn('flex items-center gap-1.5 text-sm text-text-primary', expanded ? 'flex-wrap' : 'flex-nowrap md:flex-wrap [&>*]:shrink-0 md:[&>*]:shrink')}>
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
              {step && (
                <>
                  <label htmlFor="run-start" className="pl-1">Start when…</label>
                  <WaitPicker
                    id="run-start"
                    ariaLabel="Start when"
                    script={script}
                    step={step}
                    subject={{ move: selectedMove.marker }}
                    none="Start at the beginning"
                    onChange={(wait) => edit({ type: 'setStartAfter', marker: selectedMove.marker, wait })}
                  />
                </>
              )}
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
      className={cn(
        'flex shrink-0 items-start border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 md:h-32',
        expanded ? 'h-44' : 'h-14',
      )}
    >
      {/* Collapsed, the body only scrolls sideways, so a vertical swipe on it scrolls the page. */}
      <div
        id={bodyId}
        className={cn(
          'min-w-0 flex-1 md:h-full md:overflow-y-auto md:overflow-x-hidden md:overscroll-contain',
          expanded ? 'h-full overflow-y-auto overflow-x-hidden' : 'overflow-x-auto overflow-y-hidden',
        )}
      >
        {body}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="-my-1.5 -mr-2 h-11 w-11 shrink-0 md:hidden"
        aria-expanded={expanded}
        aria-controls={bodyId}
        aria-label={expanded ? 'Show less' : 'Show more'}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </Button>
    </div>
  );
}
