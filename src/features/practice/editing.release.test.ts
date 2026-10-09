import { describe, it, expect } from 'vitest';
import { addProgression, applyEdit, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { positionsAt, resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);

/** a1 at (2, 18) holds the ball and runs through (2, 12) to (2, 4); a2 stands at (8, 18); a1 passes to a2. */
const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'attacker', at: { x: 2, y: 18 } },
  { type: 'addMarker', kind: 'attacker', at: { x: 8, y: 18 } },
  { type: 'addMarker', kind: 'ball', at: { x: 2, y: 18 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 12 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 4 } },
  { type: 'addPass', from: 'a1', to: 'a2' },
);

describe('applyEdit: setRelease', () => {
  it('sets a Release waypoint, and the ball leaves the carrier there', () => {
    const next = edits(base, { type: 'setRelease', id: 'p1', release: 0 });
    expect(next.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2', release: 0 });
    expect(validate(next).ok).toBe(true);
    expect(positionsAt(resolveStep(next, 0), 0).passes[0].start).toEqual({ x: 2, y: 12 });
  });

  it('clears it with null', () => {
    const cleared = edits(base, { type: 'setRelease', id: 'p1', release: 0 }, { type: 'setRelease', id: 'p1', release: null });
    expect(cleared.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2' });
  });

  it('returns the same script when nothing changes', () => {
    expect(applyEdit(base, { type: 'setRelease', id: 'p1', release: null })).toBe(base);
    const released = edits(base, { type: 'setRelease', id: 'p1', release: 1 });
    expect(applyEdit(released, { type: 'setRelease', id: 'p1', release: 1 })).toBe(released);
  });

  it('refuses a passer with no run, a point not on it, or a run that starts after the pass', () => {
    const still = edits(base, { type: 'removeMove', marker: 'a1' });
    expect(applyEdit(still, { type: 'setRelease', id: 'p1', release: 0 })).toMatch(/no run/);
    expect(applyEdit(base, { type: 'setRelease', id: 'p1', release: 2 })).toMatch(/not on the passer/);
    const after = edits(base, { type: 'startAfterPass', marker: 'a1', pass: 'p1' });
    expect(applyEdit(after, { type: 'setRelease', id: 'p1', release: 0 })).toMatch(/starts after this pass/);
  });

  it('drops a Release the passer\'s run no longer reaches', () => {
    const released = edits(base, { type: 'setRelease', id: 'p1', release: 1 });
    const shorter = edits(released, { type: 'removeWaypoint', marker: 'a1', index: 1 });
    expect(shorter.base.passes[0].release).toBeUndefined();
    const gone = edits(released, { type: 'removeMove', marker: 'a1' });
    expect(gone.base.passes[0].release).toBeUndefined();
    expect(validate(gone).ok).toBe(true);
  });
});

describe('applyEdit: addReleasePoint', () => {
  it('uses a waypoint tapped within a cell', () => {
    const next = edits(base, { type: 'addReleasePoint', id: 'p1', at: { x: 2.4, y: 12.3 } });
    expect(next.base.passes[0].release).toBe(0);
    expect(next.base.moves[0].waypoints).toHaveLength(2);
  });

  it('adds a waypoint where the run is tapped between waypoints, keeping later catches and Releases in step', () => {
    // p1 releases at (2, 4), the last waypoint, until the Coach taps (2, 15).
    const released = edits(base, { type: 'setRelease', id: 'p1', release: 1 });
    const next = edits(released, { type: 'addReleasePoint', id: 'p1', at: { x: 2, y: 15 } });
    expect(next.base.moves[0].waypoints).toEqual([{ x: 2, y: 15 }, { x: 2, y: 12 }, { x: 2, y: 4 }]);
    expect(next.base.passes[0].release).toBe(0);
    expect(validate(next).ok).toBe(true);
  });

  it('shifts a catch on the same run when it adds a waypoint before it', () => {
    // a2 passes back to a1, caught on the run at (2, 12); a1 then releases p3 to a3 from a new point further on.
    const withReturn = edits(
      base,
      { type: 'addMarker', kind: 'attacker', at: { x: 14, y: 18 } },
      { type: 'addPass', from: 'a2', to: 'a1' },
      { type: 'setCatch', id: 'p2', at: 0 },
      { type: 'addPass', from: 'a1', to: 'a3' },
      { type: 'addReleasePoint', id: 'p3', at: { x: 2, y: 8 } },
    );
    expect(withReturn.base.moves[0].waypoints).toEqual([{ x: 2, y: 12 }, { x: 2, y: 8 }, { x: 2, y: 4 }]);
    expect(withReturn.base.passes.find((p) => p.id === 'p2')?.at).toBe(0);
    expect(withReturn.base.passes.find((p) => p.id === 'p3')?.release).toBe(1);
    expect(validate(withReturn).ok).toBe(true);
  });

  it('refuses a passer with no run, or a tap on its start', () => {
    const still = edits(base, { type: 'removeMove', marker: 'a1' });
    expect(applyEdit(still, { type: 'addReleasePoint', id: 'p1', at: { x: 2, y: 12 } })).toMatch(/no run/);
    expect(applyEdit(base, { type: 'addReleasePoint', id: 'p1', at: { x: 2, y: 18 } })).toMatch(/further along/);
  });
});

describe('applyStepEdit: Release in a Progression', () => {
  it('records the Release as a setPass change', () => {
    const script = addProgression(base, 'time');
    const next = ok(applyStepEdit(script, 1, { type: 'setRelease', id: 'p1', release: 0 }));
    expect(next.base.passes[0].release).toBeUndefined();
    expect(next.progressions[0].changes).toEqual([{ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 0 }]);
    expect(validate(next).ok).toBe(true);
    expect(positionsAt(resolveStep(next, 1), 0).passes[0].start).toEqual({ x: 2, y: 12 });

    const cleared = ok(applyStepEdit(next, 1, { type: 'setRelease', id: 'p1', release: null }));
    expect(cleared.progressions[0].changes).toEqual([]);
  });
});
