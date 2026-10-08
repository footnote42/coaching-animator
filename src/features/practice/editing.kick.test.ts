import { describe, it, expect } from 'vitest';
import { applyEdit, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { positionsAt, resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);
const at = (x: number, y: number) => ({ x, y });
const ballPlacement = (script: PracticeScript, ball = 'ball') => script.base.placements.find((p) => p.marker === ball);

/** a1 at (2, 15) with the ball, a2 at (8, 15), on the default 20 x 20 Area. */
const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'attacker', at: at(2, 15) },
  { type: 'addMarker', kind: 'attacker', at: at(8, 15) },
  { type: 'addMarker', kind: 'ball', at: at(2, 15) },
);

describe('dropping the ball on the ground', () => {
  it('gives the ball to a player it is dropped on, and leaves it loose on the ground elsewhere', () => {
    expect(ballPlacement(base)).toEqual({ marker: 'ball', holder: 'a1' });
    const loose = edits(base, { type: 'moveMarker', marker: 'ball', at: at(5, 10) });
    expect(ballPlacement(loose)).toEqual({ marker: 'ball', cell: { x: 5, y: 10 } });
    expect(validate(loose).ok).toBe(true);
    const back = edits(loose, { type: 'moveMarker', marker: 'ball', at: at(8.4, 14.6) });
    expect(ballPlacement(back)).toEqual({ marker: 'ball', holder: 'a2' });
  });

  it('uses the reach it is given to decide who is close enough', () => {
    expect(ballPlacement(edits(base, { type: 'moveMarker', marker: 'ball', at: at(8, 12), reach: 3 }))).toEqual({ marker: 'ball', holder: 'a2' });
    expect(ballPlacement(edits(base, { type: 'moveMarker', marker: 'ball', at: at(8, 12), reach: 1 }))).toEqual({ marker: 'ball', cell: { x: 8, y: 12 } });
  });

  it('returns the same script when a loose ball is dropped on its own cell', () => {
    const loose = edits(base, { type: 'moveMarker', marker: 'ball', at: at(5, 10) });
    expect(applyEdit(loose, { type: 'moveMarker', marker: 'ball', at: at(5.2, 9.9) })).toBe(loose);
  });

  it('drops the passes of a ball that is now loose', () => {
    const passed = edits(base, { type: 'addPass', from: 'a1', to: 'a2' });
    const loose = edits(passed, { type: 'moveMarker', marker: 'ball', at: at(5, 5) });
    expect(loose.base.passes).toEqual([]);
    expect(applyEdit(loose, { type: 'addPass', from: 'a1', to: 'a2' })).toBe('The ball is lying loose: nobody has it to pass or kick.');
  });

  it('can be dropped loose inside a Progression, as a placeMarker change', () => {
    const withStep: PracticeScript = { ...base, progressions: [{ lever: 'equipment', commentary: { points: [] }, changes: [] }] };
    const next = ok(applyStepEdit(withStep, 1, { type: 'moveMarker', marker: 'ball', at: at(12, 4) }));
    expect(next.progressions[0].changes).toEqual([{ type: 'placeMarker', marker: 'ball', cell: { x: 12, y: 4 } }]);
    expect(resolveStep(next, 1).markers.find((m) => m.id === 'ball')).toMatchObject({ cell: { x: 12, y: 4 } });
    expect(resolveStep(next, 0).markers.find((m) => m.id === 'ball')?.holder).toBe('a1');
    expect(validate(next).ok).toBe(true);
  });
});

describe('Kick to space', () => {
  it('kicks from whoever has the ball to a cell, as a kick with no receiver', () => {
    const script = edits(base, { type: 'addPass', from: 'a1', to: 'a2' }, { type: 'addKickToSpace', from: 'a2', at: at(9.6, 3.2) });
    expect(script.base.passes).toEqual([
      { id: 'p1', from: 'a1', to: 'a2' },
      { id: 'k1', from: 'a2', cell: { x: 10, y: 3 }, kick: true },
    ]);
    expect(validate(script).ok).toBe(true);
    const step = resolveStep(script, 0);
    const { duration, positions } = positionsAt(step, 1000);
    expect(positionsAt(step, 0).duration).toBe(duration);
    expect(positions.ball.y).toBeLessThan(3);
  });

  it('refuses a kick from a player without the ball, or onto the kicker’s own cell', () => {
    expect(applyEdit(base, { type: 'addKickToSpace', from: 'a2', at: at(5, 5) })).toBe('A1 has the ball at that point, so the next kick must come from A1.');
    expect(applyEdit(base, { type: 'addKickToSpace', from: 'a1', at: at(2.3, 15.2) })).toBe('Tap further away to kick into space.');
    expect(typeof applyEdit(emptyScript(), { type: 'addKickToSpace', from: 'a1', at: at(5, 5) })).toBe('string');
  });

  it('leaves the ball loose: nothing can follow it, until the kick is deleted', () => {
    const kicked = edits(base, { type: 'addKickToSpace', from: 'a1', at: at(5, 5) });
    expect(applyEdit(kicked, { type: 'addPass', from: 'a1', to: 'a2' })).toBe('The ball is lying loose: nobody has it to pass or kick.');
    expect(typeof applyEdit(kicked, { type: 'addKickToSpace', from: 'a1', at: at(9, 9) })).toBe('string');
    const undone = edits(kicked, { type: 'removePass', id: 'k1' });
    expect(edits(undone, { type: 'addPass', from: 'a1', to: 'a2' }).base.passes).toHaveLength(1);
  });

  it('stays a kick and has no catch point', () => {
    const kicked = edits(base, { type: 'addKickToSpace', from: 'a1', at: at(5, 5) });
    expect(applyEdit(kicked, { type: 'setKick', id: 'k1', kick: false })).toBe('A Kick to space is always a kick: delete it to pass instead.');
    expect(applyEdit(kicked, { type: 'setCatch', id: 'k1', at: 0 })).toBe('A Kick to space has no receiver to catch on the run.');
    expect(applyEdit(kicked, { type: 'addCatchPoint', id: 'k1', at: at(5, 5) })).toBe('A Kick to space has no receiver to catch on the run.');
  });

  it('is dropped with the pass it follows when the chain breaks', () => {
    const script = edits(base, { type: 'addPass', from: 'a1', to: 'a2' }, { type: 'addKickToSpace', from: 'a2', at: at(9, 3) });
    expect(edits(script, { type: 'removePass', id: 'p1' }).base.passes).toEqual([]);
  });

  it('kicks the ball it is given, writing ball only for a second ball', () => {
    const two = edits(base, { type: 'addBall', holder: 'a2' });
    const script = edits(two, { type: 'addKickToSpace', from: 'a2', at: at(8, 4), ball: 'ball1' });
    expect(script.base.passes).toEqual([{ id: 'k1', from: 'a2', cell: { x: 8, y: 4 }, ball: 'ball1', kick: true }]);
    expect(validate(script).ok).toBe(true);
  });

  it('works inside a Progression', () => {
    const withStep: PracticeScript = { ...base, progressions: [{ lever: 'time', commentary: { points: [] }, changes: [] }] };
    const next = ok(applyStepEdit(withStep, 1, { type: 'addKickToSpace', from: 'a1', at: at(2, 4) }));
    expect(next.progressions[0].changes).toEqual([{ type: 'setPass', id: 'k1', from: 'a1', cell: { x: 2, y: 4 }, kick: true }]);
    expect(resolveStep(next, 0).passes).toEqual([]);
    expect(validate(next).ok).toBe(true);
  });
});
