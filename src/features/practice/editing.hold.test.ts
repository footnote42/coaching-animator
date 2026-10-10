import { describe, it, expect } from 'vitest';
import { addProgression, applyEdit, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript, Wait } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);
const stepEdits = (script: PracticeScript, n: number, ...list: Edit[]) => list.reduce((s, edit) => ok(applyStepEdit(s, n, edit)), script);

/**
 * a1 at (2, 18) holds the ball and runs (2, 15), (2, 12), (2, 4); a2 at (8, 18)
 * runs (8, 15), (8, 10), (8, 4); a3 at (14, 18) runs (14, 15), (14, 10).
 */
const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'attacker', at: { x: 2, y: 18 } },
  { type: 'addMarker', kind: 'attacker', at: { x: 8, y: 18 } },
  { type: 'addMarker', kind: 'attacker', at: { x: 14, y: 18 } },
  { type: 'addMarker', kind: 'ball', at: { x: 2, y: 18 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 15 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 12 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 4 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 15 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 10 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 4 } },
  { type: 'addWaypoint', marker: 'a3', at: { x: 14, y: 15 } },
  { type: 'addWaypoint', marker: 'a3', at: { x: 14, y: 10 } },
  { type: 'addPass', from: 'a1', to: 'a2' },
);

const hold = (marker: string, index: number, wait: Wait | null): Edit => ({ type: 'setWaypointHold', marker, index, hold: wait });
const holdsOf = (script: PracticeScript, n: number, marker: string) =>
  resolveStep(script, n).moves.find((m) => m.marker === marker)!.waypoints.map((w) => w.hold ?? null);

describe('applyEdit: setWaypointHold', () => {
  it('sets, changes and clears a hold on a waypoint, and the script stays valid', () => {
    const held = edits(base, hold('a2', 1, { move: 'a3' }));
    expect(held.base.moves[1].waypoints[1]).toEqual({ x: 8, y: 10, hold: { move: 'a3' } });
    expect(validate(held).ok).toBe(true);
    const changed = edits(held, hold('a2', 1, { reach: { marker: 'a3', waypoint: 1 } }));
    expect(changed.base.moves[1].waypoints[1].hold).toEqual({ reach: { marker: 'a3', waypoint: 1 } });
    const cleared = edits(changed, hold('a2', 1, null));
    expect(cleared.base.moves[1].waypoints[1]).toEqual({ x: 8, y: 10 });
    expect('hold' in cleared.base.moves[1].waypoints[1]).toBe(false);
  });

  it('returns the same script when nothing changes, and refuses a missing run or point', () => {
    expect(applyEdit(base, hold('a2', 1, null))).toBe(base);
    const held = edits(base, hold('a2', 1, { move: 'a3' }));
    expect(applyEdit(held, hold('a2', 1, { move: 'a3' }))).toBe(held);
    expect(applyEdit(base, hold('ball', 0, null))).toMatch(/no run/);
    expect(applyEdit(base, hold('a2', 9, { move: 'a3' }))).toMatch(/not on the run/);
  });

  it('refuses a hold that would make waits loop', () => {
    const result = applyStepEdit(base, 0, hold('a2', 0, { move: 'a2' }));
    expect(typeof result).toBe('string');
    expect(result).toContain('in a loop');
  });

  it('keeps the hold when its waypoint is dragged or another waypoint gets a Pace', () => {
    const held = edits(base, hold('a2', 1, { move: 'a3' }));
    const dragged = edits(held, { type: 'moveWaypoint', marker: 'a2', index: 1, at: { x: 9, y: 10 } });
    expect(dragged.base.moves[1].waypoints[1]).toEqual({ x: 9, y: 10, hold: { move: 'a3' } });
    const paced = edits(held, { type: 'setWaypointPace', marker: 'a2', index: 1, pace: 'walk' });
    expect(paced.base.moves[1].waypoints[1]).toEqual({ x: 8, y: 10, pace: 'walk', hold: { move: 'a3' } });
  });
});

describe('removeWaypoint with holds and reach waits', () => {
  const held = edits(base, hold('a2', 2, { move: 'a3' }), hold('a3', 0, { reach: { marker: 'a1', waypoint: 2 } }));

  it('carries a hold with its waypoint when an earlier one goes', () => {
    const next = edits(held, { type: 'removeWaypoint', marker: 'a2', index: 0 });
    // The hold was on (8, 4); it stays on that cell, now waypoint 1.
    expect(next.base.moves[1].waypoints).toEqual([{ x: 8, y: 10 }, { x: 8, y: 4, hold: { move: 'a3' } }]);
    expect(validate(next).ok).toBe(true);
  });

  it('drops a hold that goes with its waypoint', () => {
    const next = edits(held, { type: 'removeWaypoint', marker: 'a2', index: 2 });
    expect(next.base.moves[1].waypoints.every((w) => w.hold === undefined)).toBe(true);
  });

  it('shifts a hold that waits on a later waypoint of another run, and drops one that waits on a removed one', () => {
    const shifted = edits(held, { type: 'removeWaypoint', marker: 'a1', index: 0 });
    expect(shifted.base.moves[2].waypoints[0].hold).toEqual({ reach: { marker: 'a1', waypoint: 1 } });
    const dropped = edits(held, { type: 'removeWaypoint', marker: 'a1', index: 2 });
    expect(dropped.base.moves[2].waypoints[0].hold).toBeUndefined();
    expect(validate(dropped).ok).toBe(true);
  });
});

describe('holds in Progressions', () => {
  it('sets a hold in a Step as a setMove change and carries it to later Steps', () => {
    const one = stepEdits(addProgression(base, 'time'), 1, hold('a2', 1, { move: 'a3' }));
    expect(one.base).toEqual(base.base);
    expect(one.progressions[0].changes).toContainEqual(expect.objectContaining({ type: 'setMove', marker: 'a2' }));
    expect(holdsOf(one, 0, 'a2')).toEqual([null, null, null]);
    expect(holdsOf(one, 1, 'a2')).toEqual([null, { move: 'a3' }, null]);
    const two = addProgression(one, 'time');
    expect(holdsOf(two, 2, 'a2')).toEqual([null, { move: 'a3' }, null]);
    expect(validate(two).ok).toBe(true);
  });

  it('changes and removes a hold in a later Step without touching the earlier ones', () => {
    const two = addProgression(stepEdits(addProgression(base, 'time'), 1, hold('a2', 1, { move: 'a3' })), 'time');
    const changed = stepEdits(two, 2, hold('a2', 1, { reach: { marker: 'a3', waypoint: 0 } }));
    expect(holdsOf(changed, 1, 'a2')[1]).toEqual({ move: 'a3' });
    expect(holdsOf(changed, 2, 'a2')[1]).toEqual({ reach: { marker: 'a3', waypoint: 0 } });
    const removed = stepEdits(two, 2, hold('a2', 1, null));
    expect(holdsOf(removed, 1, 'a2')[1]).toEqual({ move: 'a3' });
    expect(holdsOf(removed, 2, 'a2')[1]).toBeNull();
    expect(validate(removed).ok).toBe(true);
  });

  it('keeps a base hold through a Step that edits another waypoint of the run', () => {
    const held = edits(base, hold('a2', 1, { move: 'a3' }));
    const next = stepEdits(addProgression(held, 'time'), 1, { type: 'moveWaypoint', marker: 'a2', index: 2, at: { x: 9, y: 4 } });
    expect(holdsOf(next, 1, 'a2')).toEqual([null, { move: 'a3' }, null]);
  });
});

describe('waypoint edits in an earlier Step shift reach indices in later Steps', () => {
  /** Step 1 gives a3 a hold on a2 reaching its waypoint 2, and a start that waits on a1 reaching waypoint 2. */
  const later = stepEdits(
    addProgression(base, 'time'),
    1,
    hold('a3', 0, { reach: { marker: 'a2', waypoint: 2 } }),
    { type: 'setStartAfter', marker: 'a3', wait: { reach: { marker: 'a1', waypoint: 2 } } },
  );
  const laterMove = (script: PracticeScript) => script.progressions[0].changes.find((c) => c.type === 'setMove' && c.marker === 'a3');

  it('records the setMove in the Progression', () => {
    expect(laterMove(later)).toEqual(
      expect.objectContaining({ after: { reach: { marker: 'a1', waypoint: 2 } } }),
    );
  });

  it('shifts them down when an earlier waypoint of the watched run goes', () => {
    const next = ok(applyStepEdit(later, 0, { type: 'removeWaypoint', marker: 'a2', index: 0 }));
    expect(holdsOf(next, 1, 'a3')[0]).toEqual({ reach: { marker: 'a2', waypoint: 1 } });
    const other = ok(applyStepEdit(later, 0, { type: 'removeWaypoint', marker: 'a1', index: 1 }));
    expect(resolveStep(other, 1).moves.find((m) => m.marker === 'a3')!.after).toEqual({ reach: { marker: 'a1', waypoint: 1 } });
    expect(validate(next).ok).toBe(true);
    expect(validate(other).ok).toBe(true);
  });

  it('shifts them up when a waypoint is inserted before, and leaves earlier ones alone', () => {
    // A catch point between a2's waypoints 1 and 2 is a new waypoint 2.
    const next = ok(applyStepEdit(later, 0, { type: 'addCatchPoint', id: 'p1', at: { x: 8, y: 7 } }));
    expect(resolveStep(next, 0).moves.find((m) => m.marker === 'a2')!.waypoints).toHaveLength(4);
    expect(holdsOf(next, 1, 'a3')[0]).toEqual({ reach: { marker: 'a2', waypoint: 3 } });
    expect(resolveStep(next, 1).moves.find((m) => m.marker === 'a3')!.after).toEqual({ reach: { marker: 'a1', waypoint: 2 } });
    expect(validate(next).ok).toBe(true);
  });

  it('drops a later wait on the removed waypoint', () => {
    const next = ok(applyStepEdit(later, 0, { type: 'removeWaypoint', marker: 'a2', index: 2 }));
    expect(holdsOf(next, 1, 'a3')[0]).toBeNull();
    expect(validate(next).ok).toBe(true);
  });

  it('leaves a later Step alone when it replaces that run', () => {
    const ownRun = stepEdits(later, 1, { type: 'moveWaypoint', marker: 'a2', index: 2, at: { x: 9, y: 4 } }, hold('a3', 0, { reach: { marker: 'a2', waypoint: 2 } }));
    const next = ok(applyStepEdit(ownRun, 0, { type: 'removeWaypoint', marker: 'a2', index: 0 }));
    expect(holdsOf(next, 1, 'a3')[0]).toEqual({ reach: { marker: 'a2', waypoint: 2 } });
  });
});
