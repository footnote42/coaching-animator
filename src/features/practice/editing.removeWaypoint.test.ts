import { describe, it, expect } from 'vitest';
import { addProgression, applyEdit, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);

/**
 * a1 at (2, 18) holds the ball and runs (2, 15), (2, 12), (2, 4); a2 at (8, 18)
 * runs (8, 15), (8, 10), (8, 4). a1 releases p1 at its waypoint 2 and a2 catches
 * it at its waypoint 2.
 */
const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'attacker', at: { x: 2, y: 18 } },
  { type: 'addMarker', kind: 'attacker', at: { x: 8, y: 18 } },
  { type: 'addMarker', kind: 'ball', at: { x: 2, y: 18 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 15 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 12 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 4 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 15 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 10 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 4 } },
  { type: 'addPass', from: 'a1', to: 'a2' },
  { type: 'setRelease', id: 'p1', release: 2 },
  { type: 'setCatch', id: 'p1', at: 2 },
);

describe('applyEdit: removeWaypoint keeps catches and Releases on their waypoints', () => {
  it('shifts a later Release down one when an earlier waypoint of the passer goes', () => {
    const next = edits(base, { type: 'removeWaypoint', marker: 'a1', index: 1 });
    expect(next.base.moves[0].waypoints).toEqual([{ x: 2, y: 15 }, { x: 2, y: 4 }]);
    expect(next.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', release: 1, at: 2 });
    expect(validate(next).ok).toBe(true);
  });

  it('shifts a later catch down one when an earlier waypoint of the receiver goes', () => {
    const next = edits(base, { type: 'removeWaypoint', marker: 'a2', index: 0 });
    expect(next.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', release: 2, at: 1 });
    expect(validate(next).ok).toBe(true);
  });

  it('drops a catch or Release on the removed waypoint, and leaves earlier ones alone', () => {
    const atEarlier = edits(base, { type: 'setRelease', id: 'p1', release: 0 }, { type: 'setCatch', id: 'p1', at: 1 });
    const noCatch = edits(atEarlier, { type: 'removeWaypoint', marker: 'a2', index: 1 });
    expect(noCatch.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', release: 0 });
    const noRelease = edits(base, { type: 'removeWaypoint', marker: 'a1', index: 2 });
    expect(noRelease.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', at: 2 });
    expect(validate(noCatch).ok).toBe(true);
    expect(validate(noRelease).ok).toBe(true);
  });

  it('keeps waypoint Paces on their waypoints', () => {
    const sprinting = edits(base, { type: 'setWaypointPace', marker: 'a1', index: 2, pace: 'sprint' });
    const next = edits(sprinting, { type: 'removeWaypoint', marker: 'a1', index: 1 });
    expect(next.base.moves[0].waypoints).toEqual([{ x: 2, y: 15 }, { x: 2, y: 4, pace: 'sprint' }]);
  });
});

describe('applyStepEdit: removeWaypoint in a Progression', () => {
  it('records the shifted catch and Release as a setPass change', () => {
    const script = addProgression(base, 'time');
    const shorter = ok(applyStepEdit(script, 1, { type: 'removeWaypoint', marker: 'a1', index: 0 }));
    const next = ok(applyStepEdit(shorter, 1, { type: 'removeWaypoint', marker: 'a2', index: 2 }));
    expect(next.base).toEqual(base.base);
    expect(resolveStep(next, 1).passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', release: 1 });
    expect(next.progressions[0].changes).toContainEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1 });
    expect(validate(next).ok).toBe(true);
  });
});

describe('applyStepEdit: waypoint edits carry into later Progressions', () => {
  /** Step 1 releases p1 at a1's waypoint 1 and catches it at a2's waypoint 2, as its own setPass. */
  const withLater = ok(applyStepEdit(addProgression(base, 'time'), 1, { type: 'setRelease', id: 'p1', release: 1 }));
  const laterPass = (script: PracticeScript, n = 0) => script.progressions[n].changes.find((c) => c.type === 'setPass');

  it('shifts a later Progression’s Release down one when an earlier waypoint goes', () => {
    expect(laterPass(withLater)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1, at: 2 });
    const next = ok(applyStepEdit(withLater, 0, { type: 'removeWaypoint', marker: 'a1', index: 0 }));
    expect(laterPass(next)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 0, at: 2 });
    expect(resolveStep(next, 1).passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', release: 0, at: 2 });
    expect(validate(next).ok).toBe(true);
  });

  it('drops a later Progression’s Release on the removed waypoint, and leaves earlier ones alone', () => {
    const dropped = ok(applyStepEdit(withLater, 0, { type: 'removeWaypoint', marker: 'a1', index: 1 }));
    expect(laterPass(dropped)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', at: 2 });
    const kept = ok(applyStepEdit(withLater, 0, { type: 'removeWaypoint', marker: 'a2', index: 2 }));
    expect(laterPass(kept)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1 });
    expect(validate(dropped).ok).toBe(true);
    expect(validate(kept).ok).toBe(true);
  });

  it('shifts Progressions after an edited Progression', () => {
    const twoSteps = ok(applyStepEdit(addProgression(withLater, 'time'), 2, { type: 'setCatch', id: 'p1', at: 1 }));
    const next = ok(applyStepEdit(twoSteps, 1, { type: 'removeWaypoint', marker: 'a2', index: 0 }));
    expect(laterPass(next, 1)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1, at: 0 });
    expect(validate(next).ok).toBe(true);
  });

  it('leaves a later Progression alone when it replaces that Run', () => {
    const ownRun = ok(applyStepEdit(withLater, 1, { type: 'moveWaypoint', marker: 'a1', index: 2, at: { x: 3, y: 4 } }));
    expect(ownRun.progressions[0].changes).toContainEqual(expect.objectContaining({ type: 'setMove', marker: 'a1' }));
    const next = ok(applyStepEdit(ownRun, 0, { type: 'removeWaypoint', marker: 'a1', index: 0 }));
    expect(laterPass(next)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1, at: 2 });
    expect(validate(next).ok).toBe(true);
  });

  it('shifts a later Progression’s catch up one when a catch point adds an earlier waypoint', () => {
    const next = ok(applyStepEdit(withLater, 0, { type: 'addCatchPoint', id: 'p1', at: { x: 8, y: 7 } }));
    expect(next.base.moves[1].waypoints).toHaveLength(4);
    expect(laterPass(next)).toEqual({ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1, at: 3 });
    expect(validate(next).ok).toBe(true);
  });
});
