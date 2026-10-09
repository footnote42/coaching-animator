import { describe, it, expect } from 'vitest';
import { applyEdit, applyStepEdit, emptyScript, isCollector, lastLooseBall, type Edit } from '@/features/practice/editing';
import { formatError, positionsAt, resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

function valid(script: PracticeScript): PracticeScript {
  const result = validate(script);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return script;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);
const at = (x: number, y: number) => ({ x, y });
const moveOf = (script: PracticeScript, marker: string) => script.base.moves.find((m) => m.marker === marker);

/** a1 at (2, 15) with the ball, a2 at (8, 15), d1 at (12, 2), on the default 20 x 20 Area. */
const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'attacker', at: at(2, 15) },
  { type: 'addMarker', kind: 'attacker', at: at(8, 15) },
  { type: 'addMarker', kind: 'defender', at: at(12, 2) },
  { type: 'addMarker', kind: 'cone', at: at(0, 0) },
  { type: 'addMarker', kind: 'ball', at: at(2, 15) },
);
/** a1 kicks up to (2, 5): the ball rolls on and comes to rest on (2, 3). */
const kicked = edits(base, { type: 'addKickToSpace', from: 'a1', at: at(2, 5) });
const REST = { x: 2, y: 3 };

describe('setCollector', () => {
  it('knows where the kicked ball comes to rest', () => {
    expect(lastLooseBall(kicked)).toEqual({ ball: 'ball', cell: REST, kick: 'k1' });
    expect(lastLooseBall(base)).toBeUndefined();
  });

  it('gives a collector with no Run one to the ball, after which they pass it on', () => {
    const sent = edits(kicked, { type: 'setCollector', marker: 'a2' });
    expect(moveOf(sent, 'a2')).toEqual({ marker: 'a2', waypoints: [REST] });
    expect(isCollector(sent, 'a2')).toBe(true);
    expect(isCollector(sent, 'a1')).toBe(false);
    const passed = valid(edits(sent, { type: 'addPass', from: 'a2', to: 'a1' }));
    expect(passed.base.passes[1]).toEqual({ id: 'p1', from: 'a2', to: 'a1' });
    expect(positionsAt(resolveStep(passed, 0), 0).passes[1].pickup).toBeDefined();
    expect(lastLooseBall(passed)?.collect).toBe('p1');
  });

  it('refuses a pass or kick of the loose ball from anyone not sent to it', () => {
    const sent = edits(kicked, { type: 'setCollector', marker: 'a2' });
    const loose = 'The ball is lying loose: use Collect to send a player to it, then pass or kick from them.';
    expect(applyEdit(sent, { type: 'addPass', from: 'a1', to: 'a2' })).toBe(loose);
    expect(applyEdit(sent, { type: 'addKickToSpace', from: 'd1', at: at(10, 10) })).toBe(loose);
    expect(edits(sent, { type: 'addKickToSpace', from: 'a2', at: at(10, 10) }).base.passes[1]).toEqual({ id: 'k2', from: 'a2', cell: { x: 10, y: 10 }, kick: true });
  });

  it('extends a Run that ends far from the ball, and redirects one that ends close by', () => {
    const far = edits(kicked, { type: 'addWaypoint', marker: 'a2', at: at(8, 10) }, { type: 'setCollector', marker: 'a2' });
    expect(moveOf(far, 'a2')?.waypoints).toEqual([at(8, 10), REST]);

    const close = edits(
      kicked,
      { type: 'addWaypoint', marker: 'a2', at: at(8, 10) },
      { type: 'addWaypoint', marker: 'a2', at: at(3, 5) },
      { type: 'setWaypointPace', marker: 'a2', index: 1, pace: 'sprint' },
      { type: 'setCollector', marker: 'a2' },
    );
    expect(moveOf(close, 'a2')?.waypoints).toEqual([at(8, 10), { ...REST, pace: 'sprint' }]);
    expect(valid(close)).toBe(close);
  });

  it('returns the same script when the player already runs to the ball', () => {
    const sent = edits(kicked, { type: 'setCollector', marker: 'a2' });
    expect(applyEdit(sent, { type: 'setCollector', marker: 'a2' })).toBe(sent);
  });

  it('hands the pass that Collects the ball to the new collector, from either team', () => {
    const passed = edits(kicked, { type: 'setCollector', marker: 'a2' }, { type: 'addPass', from: 'a2', to: 'a1' });
    const taken = valid(edits(passed, { type: 'setCollector', marker: 'd1' }));
    expect(moveOf(taken, 'd1')?.waypoints).toEqual([REST]);
    expect(taken.base.passes[1]).toEqual({ id: 'p1', from: 'd1', to: 'a1' });
    // a2 still runs to where the ball was.
    expect(moveOf(taken, 'a2')?.waypoints).toEqual([REST]);
  });

  it('refuses a ball that is not loose, a player who cannot carry it, and the next receiver', () => {
    expect(applyEdit(base, { type: 'setCollector', marker: 'a2' })).toBe('The ball is not lying loose: kick it to space or put it on the ground first.');
    expect(applyEdit(kicked, { type: 'setCollector', marker: 'cone1' })).toBe('Only attackers, defenders and coaches Collect the ball.');
    const passed = edits(kicked, { type: 'setCollector', marker: 'a2' }, { type: 'addPass', from: 'a2', to: 'a1' });
    expect(applyEdit(passed, { type: 'setCollector', marker: 'a1' })).toBe('That player receives the pass after the Collect: pick someone else, or delete that pass first.');
  });

  it('lets a kicker chase and collect their own kick', () => {
    const released = edits(
      base,
      { type: 'addWaypoint', marker: 'a1', at: at(2, 13) },
      { type: 'addKickToSpace', from: 'a1', at: at(2, 5) },
      { type: 'setRelease', id: 'k1', release: 0 },
    );
    const chased = valid(edits(released, { type: 'setCollector', marker: 'a1' }, { type: 'addPass', from: 'a1', to: 'a2' }));
    expect(moveOf(chased, 'a1')?.waypoints).toEqual([at(2, 13), REST]);
  });

  it('sends a player to a ball that starts loose, and drops their pass when the ball is moved away', () => {
    const loose = edits(base, { type: 'moveMarker', marker: 'ball', at: at(5, 10) });
    const passed = valid(edits(loose, { type: 'setCollector', marker: 'a2' }, { type: 'addPass', from: 'a2', to: 'a1' }));
    expect(moveOf(passed, 'a2')?.waypoints).toEqual([at(5, 10)]);
    expect(passed.base.passes).toEqual([{ id: 'p1', from: 'a2', to: 'a1' }]);
    expect(edits(passed, { type: 'moveMarker', marker: 'ball', at: at(15, 10) }).base.passes).toEqual([]);
  });

  it('is recorded as changes in a Progression', () => {
    const withStep: PracticeScript = { ...kicked, progressions: [{ lever: 'time', commentary: { points: [] }, changes: [] }] };
    const sent = ok(applyStepEdit(withStep, 1, { type: 'setCollector', marker: 'd1' }));
    const next = ok(applyStepEdit(sent, 1, { type: 'addPass', from: 'd1', to: 'a1' }));
    expect(next.progressions[0].changes).toEqual([
      { type: 'setMove', marker: 'd1', waypoints: [REST] },
      { type: 'setPass', id: 'p1', from: 'd1', to: 'a1' },
    ]);
    expect(resolveStep(next, 0).passes).toHaveLength(1);
    expect(valid(next)).toBe(next);
  });
});
