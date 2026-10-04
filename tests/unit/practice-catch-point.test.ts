import { describe, it, expect } from 'vitest';
import { applyEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}
const run = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, e) => ok(applyEdit(s, e)), script);
const at = (x: number, y: number) => ({ x, y });

/** a1 holds the ball and passes to a2, whose Run goes (2,2) -> (2,10) -> (10,10). */
function setup(): PracticeScript {
  return run(
    emptyScript({ width: 20, length: 20 }),
    { type: 'addMarker', kind: 'attacker', at: at(2, 2) },
    { type: 'addMarker', kind: 'attacker', at: at(2, 2) },
    { type: 'moveMarker', marker: 'a1', at: at(10, 2) },
    { type: 'addMarker', kind: 'ball', at: at(10, 2) },
    { type: 'addWaypoint', marker: 'a2', at: at(2, 10) },
    { type: 'addWaypoint', marker: 'a2', at: at(10, 10) },
    { type: 'addPass', from: 'a1', to: 'a2' },
  );
}

describe('addCatchPoint', () => {
  it('inserts a waypoint on the Run and catches there', () => {
    const script = run(setup(), { type: 'addCatchPoint', id: 'p1', at: at(3.2, 6.4) });
    expect(script.base.moves[0].waypoints).toEqual([at(2, 6), at(2, 10), at(10, 10)]);
    expect(script.base.passes[0].at).toBe(0);
    expect(validate(script).ok).toBe(true);
  });

  it('reuses an existing waypoint when the tap is close to it', () => {
    const script = run(setup(), { type: 'addCatchPoint', id: 'p1', at: at(2.6, 9.5) });
    expect(script.base.moves[0].waypoints).toHaveLength(2);
    expect(script.base.passes[0].at).toBe(0);
  });

  it('catches at the end of the Run when the tap is near the last waypoint', () => {
    const withCatch = run(setup(), { type: 'addCatchPoint', id: 'p1', at: at(2, 6) });
    const script = run(withCatch, { type: 'addCatchPoint', id: 'p1', at: at(10, 10) });
    expect(script.base.passes[0].at).toBeUndefined();
  });

  it('shifts the catch points of other passes at or after the new waypoint', () => {
    const script = setup();
    // A second pass to the same receiver, catching at waypoint 1 (the corner at (2,10)).
    const two = { ...script, base: { ...script.base, passes: [...script.base.passes, { id: 'p2', from: 'a1', to: 'a2', at: 1 }] } };
    const shifted = run(two, { type: 'addCatchPoint', id: 'p1', at: at(2, 4) });
    expect(shifted.base.passes.find((p) => p.id === 'p1')?.at).toBe(0);
    expect(shifted.base.passes.find((p) => p.id === 'p2')?.at).toBe(2);
  });

  it('removes the catch point with setCatch null', () => {
    const withCatch = run(setup(), { type: 'addCatchPoint', id: 'p1', at: at(2, 6) });
    const script = run(withCatch, { type: 'setCatch', id: 'p1', at: null });
    expect(script.base.passes[0].at).toBeUndefined();
  });

  it('refuses when the receiver has no Run', () => {
    const noRun = run(setup(), { type: 'removeMove', marker: 'a2' });
    expect(typeof applyEdit(noRun, { type: 'addCatchPoint', id: 'p1', at: at(2, 6) })).toBe('string');
  });
});
