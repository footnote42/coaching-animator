'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CONE_OUTLINE, markerColour } from '@/features/practice/markerColour';
import { BALL_CARRIER_KINDS, CONE_COLOURS, LYING_KINDS, MAX_BALLS, PACES, type Pace } from '@/features/practice/schema';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { cn } from '@/lib/utils';

export const PACE_NAMES: Record<Pace, string> = { walk: 'Walk', jog: 'Jog', sprint: 'Sprint' };

/** Controls for the selected marker: label, colour, Lying, Run Pace, ball and Pass/Kick. */
export function SelectionControls({ workspace }: { workspace: EditorWorkspace }) {
  const { editing, selectedMarker, selectedMove, selection, balls, carriedBall, tool, passKind, startPass, edit, deleteSelection } = workspace;
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  useEffect(() => {
    setLabelDraft(null);
  }, [selectedMarker?.id]);

  const heldBall = selectedMarker && balls.find((b) => b.holder === selectedMarker.id);
  const canGiveBall =
    selectedMarker &&
    !heldBall &&
    balls.length > 0 &&
    balls.length < MAX_BALLS &&
    (BALL_CARRIER_KINDS as readonly string[]).includes(selectedMarker.kind);

  return (
    <>
    {editing && selectedMarker && (
      <>
        <label htmlFor="marker-label" className="sr-only">Label</label>
        <input
          id="marker-label"
          type="text"
          placeholder={selectedMarker.id}
          value={labelDraft ?? selectedMarker.label ?? ''}
          onChange={(e) => setLabelDraft(e.target.value)}
          onBlur={() => {
            if (labelDraft !== null && labelDraft !== (selectedMarker.label ?? '')) {
              edit({ type: 'setLabel', marker: selectedMarker.id, label: labelDraft });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          maxLength={4}
          className="h-11 w-16 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-center text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {selectedMarker.kind === 'cone' && (
          <div role="group" aria-label="Cone colour" className="flex items-center gap-1">
            {CONE_COLOURS.map((colour) => {
              const current = (selectedMarker.colour ?? 'yellow') === colour;
              const name = `${colour[0].toUpperCase()}${colour.slice(1)} cone`;
              return (
                <button
                  key={colour}
                  type="button"
                  aria-label={name}
                  title={name}
                  aria-pressed={current}
                  onClick={() => edit({ type: 'setColour', marker: selectedMarker.id, colour })}
                  className={cn('h-11 w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', current && 'bg-[var(--color-surface)]')}
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
        {(LYING_KINDS as readonly string[]).includes(selectedMarker.kind) && (
          <Button
            type="button"
            variant={selectedMarker.lying ? 'default' : 'outline'}
            className="h-11"
            aria-pressed={!!selectedMarker.lying}
            title="Lay flat on the ground for this Step"
            onClick={() => edit({ type: 'setLying', marker: selectedMarker.id, lying: !selectedMarker.lying })}
          >
            Lying
          </Button>
        )}
        {selectedMove ? (
          <>
            <label htmlFor="run-pace">Pace</label>
            <select
              id="run-pace"
              value={selectedMove.pace ?? 'jog'}
              onChange={(e) => edit({ type: 'setPace', marker: selectedMove.marker, pace: e.target.value as Pace })}
              className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
            >
              {PACES.map((pace) => (
                <option key={pace} value={pace}>{PACE_NAMES[pace]}</option>
              ))}
            </select>
            {selection.waypoint !== null && selectedMove.waypoints[selection.waypoint] && (
              <>
                <label htmlFor="segment-pace">Segment {selection.waypoint + 1}</label>
                <select
                  id="segment-pace"
                  title="Pace of the run into this point"
                  value={selectedMove.waypoints[selection.waypoint].pace ?? ''}
                  onChange={(e) =>
                    edit({
                      type: 'setWaypointPace',
                      marker: selectedMove.marker,
                      index: selection.waypoint!,
                      pace: e.target.value === '' ? null : (e.target.value as Pace),
                    })
                  }
                  className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
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
        ) : selectedMarker.kind === 'ball' ? (
          <span className="text-xs">{selectedMarker.holder ? 'Drag the player to move the ball.' : 'Lying loose. Drag it onto a player to give it to them, or use Collect to send a player to it.'}</span>
        ) : (
          <span className="text-xs">No run yet: use Draw a run.</span>
        )}
        {heldBall && (
          <Button
            variant="outline"
            className="h-11"
            onClick={() => edit({ type: 'removeMarker', marker: heldBall.id })}
          >
            Remove ball
          </Button>
        )}
        {canGiveBall && (
          <Button variant="outline" className="h-11" onClick={() => edit({ type: 'addBall', holder: selectedMarker.id })}>
            Give a ball
          </Button>
        )}
        {carriedBall && (
          <div role="group" aria-label="Ball carrier" className="flex items-center gap-1">
            {(['pass', 'kick'] as const).map((kind) => {
              const on = tool === 'pass' && passKind === kind;
              return (
                <Button
                  key={kind}
                  variant={on ? 'default' : 'outline'}
                  className="h-11"
                  aria-pressed={on}
                  onClick={() => startPass(kind, carriedBall)}
                >
                  {kind === 'pass' ? 'Pass' : 'Kick'}
                </Button>
              );
            })}
          </div>
        )}
        <Button
          variant="outline"
          className="h-11"
          aria-label={selection.waypoint !== null ? 'Delete waypoint' : 'Delete marker'}
          title={selection.waypoint !== null ? 'Delete waypoint' : 'Delete marker'}
          onClick={deleteSelection}
        >
          <Trash2 /> Delete
        </Button>
      </>
    )}
    </>
  );
}
