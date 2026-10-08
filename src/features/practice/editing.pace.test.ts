import { describe, it, expect } from 'vitest';
import { addProgression, applyEdit, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { positionsAt, resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);
const stepEdits = (script: PracticeScript, n: number, ...list: Edit[]) =>
  list.reduce((s, edit) => ok(applyStepEdit(s, n, edit)), script);

/** a1 at (2, 2) jogs to (2, 8), then on to (2, 18). */
const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'attacker', at: { x: 2, y: 2 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 8 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 18 } },
);
const sprintOn: Edit = { type: 'setWaypointPace', marker: 'a1', index: 1, pace: 'sprint' };

describe('applyEdit: setWaypointPace', () => {
  it('makes a jog-then-sprint Run, and the script stays valid', () => {
    const next = edits(base, sprintOn);
    expect(next.base.moves[0].waypoints).toEqual([{ x: 2, y: 8 }, { x: 2, y: 18, pace: 'sprint' }]);
    expect(next.base.moves[0].pace).toBeUndefined();
    expect(validate(next).ok).toBe(true);
    // The sprint makes the Run quicker.
    expect(positionsAt(resolveStep(next, 0), 0).duration).toBeLessThan(positionsAt(resolveStep(base, 0), 0).duration);
  });

  it('clears the Pace with null, back to the Run Pace', () => {
    const cleared = edits(base, sprintOn, { type: 'setWaypointPace', marker: 'a1', index: 1, pace: null });
    expect(cleared.base.moves[0].waypoints[1]).toEqual({ x: 2, y: 18 });
    expect('pace' in cleared.base.moves[0].waypoints[1]).toBe(false);
  });

  it('returns the same script when nothing changes', () => {
    expect(applyEdit(base, { type: 'setWaypointPace', marker: 'a1', index: 0, pace: null })).toBe(base);
    const sprinting = edits(base, sprintOn);
    expect(applyEdit(sprinting, sprintOn)).toBe(sprinting);
  });

  it('refuses a marker with no run or a point not on it', () => {
    const withCone = edits(base, { type: 'addMarker', kind: 'cone', at: { x: 5, y: 5 } });
    expect(applyEdit(withCone, { type: 'setWaypointPace', marker: 'cone1', index: 0, pace: 'walk' })).toMatch(/no run/);
    expect(applyEdit(base, { type: 'setWaypointPace', marker: 'a1', index: 2, pace: 'walk' })).toMatch(/not on the run/);
  });

  it('keeps the Pace when the waypoint is dragged', () => {
    const moved = edits(base, sprintOn, { type: 'moveWaypoint', marker: 'a1', index: 1, at: { x: 6, y: 18 } });
    expect(moved.base.moves[0].waypoints[1]).toEqual({ x: 6, y: 18, pace: 'sprint' });
  });

  it('gives a catch point added on a sprint segment the same Pace', () => {
    const passing = edits(
      base,
      sprintOn,
      { type: 'addMarker', kind: 'attacker', at: { x: 10, y: 10 } },
      { type: 'addBall', holder: 'a2' },
      { type: 'addPass', from: 'a2', to: 'a1' },
    );
    const id = passing.base.passes[0].id;
    const caught = edits(passing, { type: 'addCatchPoint', id, at: { x: 2, y: 13 } });
    expect(caught.base.moves[0].waypoints).toEqual([{ x: 2, y: 8 }, { x: 2, y: 13, pace: 'sprint' }, { x: 2, y: 18, pace: 'sprint' }]);
    expect(validate(caught).ok).toBe(true);
  });

  it('records the Pace in a Progression as a setMove change', () => {
    const script = stepEdits(addProgression(base, 'time'), 1, sprintOn);
    expect(script.base.moves[0].waypoints[1].pace).toBeUndefined();
    expect(script.progressions[0].changes).toEqual([
      { type: 'setMove', marker: 'a1', waypoints: [{ x: 2, y: 8 }, { x: 2, y: 18, pace: 'sprint' }] },
    ]);
    expect(resolveStep(script, 1).moves[0].waypoints[1].pace).toBe('sprint');
    expect(validate(script).ok).toBe(true);
  });
});
