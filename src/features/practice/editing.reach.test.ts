import { describe, it, expect } from 'vitest';
import { applyEdit, applyStepEdit } from './editing';
import { validate } from './engine';
import type { PracticeScript } from './schema';

function script(): PracticeScript {
  const result = validate({
    schemaVersion: 1,
    area: { width: 40, length: 30 },
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 0, y: 0 } },
        { marker: 'a2', cell: { x: 10, y: 0 } },
        { marker: 'ball', holder: 'a1' },
      ],
      moves: [
        { marker: 'a1', waypoints: [{ x: 0, y: 4 }] },
        { marker: 'a2', waypoints: [{ x: 10, y: 4 }, { x: 10, y: 8 }, { x: 10, y: 12 }] },
      ],
      passes: [],
    },
  });
  if (!result.ok) throw new Error('bad fixture');
  return result.script;
}

describe('editing reach waits', () => {
  it('sets a run to start on a reach, and clears it', () => {
    const wait = { reach: { marker: 'a2', waypoint: 1 } };
    const set = applyEdit(script(), { type: 'setStartAfter', marker: 'a1', wait });
    expect(typeof set).not.toBe('string');
    expect((set as PracticeScript).base.moves[0].after).toEqual(wait);
    const cleared = applyEdit(set as PracticeScript, { type: 'setStartAfter', marker: 'a1', wait: null });
    expect((cleared as PracticeScript).base.moves[0].after).toBeUndefined();
  });

  it('sets a pass to wait on a reach', () => {
    const withPass = applyEdit(script(), { type: 'addPass', from: 'a1', to: 'a2' }) as PracticeScript;
    const id = withPass.base.passes[0].id;
    const wait = { reach: { marker: 'a2', waypoint: 2 } };
    const set = applyEdit(withPass, { type: 'setPassAfter', id, wait }) as PracticeScript;
    expect(set.base.passes[0].after).toEqual(wait);
  });

  it('refuses a looping wait with a plain message', () => {
    const first = applyStepEdit(script(), 0, { type: 'setStartAfter', marker: 'a1', wait: { reach: { marker: 'a2', waypoint: 1 } } }) as PracticeScript;
    const second = applyStepEdit(first, 0, { type: 'setStartAfter', marker: 'a2', wait: { reach: { marker: 'a1', waypoint: 0 } } });
    expect(typeof second).toBe('string');
    expect(second).toContain('in a loop');
  });

  it('keeps a reach on its waypoint when an earlier waypoint is removed, and drops one on the removed waypoint', () => {
    const base = applyEdit(script(), { type: 'setStartAfter', marker: 'a1', wait: { reach: { marker: 'a2', waypoint: 2 } } }) as PracticeScript;
    const removedEarlier = applyEdit(base, { type: 'removeWaypoint', marker: 'a2', index: 0 }) as PracticeScript;
    expect(removedEarlier.base.moves[0].after).toEqual({ reach: { marker: 'a2', waypoint: 1 } });
    const removedThat = applyEdit(base, { type: 'removeWaypoint', marker: 'a2', index: 2 }) as PracticeScript;
    expect(removedThat.base.moves[0].after).toBeUndefined();
  });
});
