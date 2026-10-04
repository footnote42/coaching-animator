import { describe, it, expect } from 'vitest';
import { validate, warnings, formatWarning, isForwardPass, formatError } from './engine';
import type { Direction } from './schema';

/** a1 at (10,10) holds the ball and passes to a2, who stands at `to`. */
function script(to: { x: number; y: number }, direction?: Direction, extra: Record<string, unknown> = {}) {
  const input = {
    schemaVersion: 1,
    area: { width: 30, length: 30 },
    ...(direction ? { direction } : {}),
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 10, y: 10 } },
        { marker: 'a2', cell: to },
        { marker: 'ball', holder: 'a1' },
      ],
      passes: [{ id: 'p1', from: 'a1', to: 'a2' }],
    },
    ...extra,
  };
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return result.script;
}

describe('forward pass warnings', () => {
  it('has none without a direction, or with none', () => {
    expect(warnings(script({ x: 10, y: 2 }))).toEqual([]);
    expect(warnings(script({ x: 10, y: 2 }, 'none'))).toEqual([]);
  });

  it('allows a level pass', () => {
    expect(warnings(script({ x: 15, y: 10 }, 'up'))).toEqual([]);
  });

  it('allows a backward pass', () => {
    expect(warnings(script({ x: 10, y: 14 }, 'up'))).toEqual([]);
  });

  it('warns on a forward pass', () => {
    const found = warnings(script({ x: 10, y: 8 }, 'up'));
    expect(found).toEqual([{ step: 0, pass: 'p1', message: 'Pass 1 goes forward' }]);
    expect(formatWarning(found[0])).toBe('Pass 1 goes forward');
  });

  it.each([
    ['up', { x: 10, y: 9 }],
    ['down', { x: 10, y: 11 }],
    ['left', { x: 9, y: 10 }],
    ['right', { x: 11, y: 10 }],
  ] as const)('direction %s warns on a pass one metre that way', (direction, to) => {
    expect(warnings(script(to, direction))).toHaveLength(1);
  });

  it.each([
    ['up', { x: 10, y: 11 }],
    ['down', { x: 10, y: 9 }],
    ['left', { x: 11, y: 10 }],
    ['right', { x: 9, y: 10 }],
  ] as const)('direction %s allows a pass one metre the other way', (direction, to) => {
    expect(warnings(script(to, direction))).toEqual([]);
  });

  it('measures only along the direction: a sideways pass is level', () => {
    expect(warnings(script({ x: 20, y: 10 }, 'up'))).toEqual([]);
  });

  it('tolerates up to and including 0.5 m, and warns beyond', () => {
    const from = { x: 10, y: 10 };
    expect(isForwardPass('up', from, { x: 10, y: 9.6 })).toBe(false);
    expect(isForwardPass('up', from, { x: 10, y: 9.5 })).toBe(false);
    expect(isForwardPass('up', from, { x: 10, y: 9.49 })).toBe(true);
    expect(isForwardPass('right', from, { x: 10.5, y: 10 })).toBe(false);
    expect(isForwardPass('right', from, { x: 10.51, y: 10 })).toBe(true);
    expect(isForwardPass(undefined, from, { x: 10, y: 0 })).toBe(false);
  });

  it('uses the real catch point on a run, where the ball leads the receiver', () => {
    // a2 runs up from (10,10) and catches at its first waypoint; the catch lands ahead of the throw.
    const input = script({ x: 14, y: 10 }, 'up', {});
    const withRun = {
      ...input,
      base: {
        ...input.base,
        moves: [{ marker: 'a2', waypoints: [{ x: 14, y: 6 }, { x: 14, y: 2 }] }],
        passes: [{ id: 'p1', from: 'a1', to: 'a2', at: 0 }],
      },
    };
    const result = validate(withRun);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(warnings(result.script)).toHaveLength(1);
  });

  it('names the Step for a pass in a Progression', () => {
    const base = script({ x: 10, y: 14 }, 'up');
    const withProgression = {
      ...base,
      progressions: [
        {
          lever: 'space',
          commentary: { points: [] },
          changes: [{ type: 'placeMarker', marker: 'a2', cell: { x: 10, y: 4 } }],
        },
      ],
    };
    const result = validate(withProgression);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    const found = warnings(result.script);
    expect(found).toEqual([{ step: 1, pass: 'p1', message: 'Pass 1 goes forward' }]);
    expect(formatWarning(found[0])).toBe('Step 2: Pass 1 goes forward');
  });
});
