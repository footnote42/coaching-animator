import { describe, it, expect } from 'vitest';
import { validate, warnings, formatWarning, isForwardPass, formatError, positionsAt, resolveStep, KICK_SPEED_MPS } from './engine';
import { applyEdit } from './editing';
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
    expect(found).toEqual([{ step: 0, pass: 'p1', kind: 'forward', message: 'Pass 1 goes forward' }]);
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
    expect(found).toEqual([{ step: 1, pass: 'p1', kind: 'forward', message: 'Pass 1 goes forward' }]);
    expect(formatWarning(found[0])).toBe('Step 2: Pass 1 goes forward');
  });
});

/** The 3 v 2 overlap: 3 sprints to a catch point on its run while 2 is still waiting for the ball. */
function overlap(after?: { pass: string }) {
  const result = validate({
    schemaVersion: 1,
    area: { width: 30, length: 20 },
    direction: 'up',
    markers: [
      { id: 'a1', kind: 'attacker', label: '1' },
      { id: 'a2', kind: 'attacker', label: '2' },
      { id: 'a3', kind: 'attacker', label: '3' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 12, y: 17 } },
        { marker: 'a2', cell: { x: 17, y: 18 } },
        { marker: 'a3', cell: { x: 22, y: 19 } },
        { marker: 'ball', holder: 'a1' },
      ],
      moves: [
        { marker: 'a1', waypoints: [{ x: 12, y: 12 }], pace: 'jog' },
        { marker: 'a2', waypoints: [{ x: 17, y: 13 }], pace: 'jog' },
        { marker: 'a3', waypoints: [{ x: 22, y: 12 }, { x: 24, y: 4 }], pace: 'sprint', ...(after ? { after } : {}) },
      ],
      passes: [
        { id: 'p1', from: 'a1', to: 'a2' },
        { id: 'p2', from: 'a2', to: 'a3', at: 0 },
      ],
    },
  });
  if (!result.ok) throw new Error(result.errors.map(formatError).join(String.fromCharCode(10)));
  return result.script;
}

describe('early receiver warnings', () => {
  it('warns when the receiver reaches the catch point before the passer has the ball', () => {
    const early = warnings(overlap()).filter((w) => w.kind === 'early');
    expect(early).toEqual([
      {
        step: 0,
        pass: 'p2',
        kind: 'early',
        message: '3 reaches the catch point before 2 has the ball',
        fix: { marker: 'a3', afterPass: 'p1' },
      },
    ]);
    expect(formatWarning(early[0])).toBe('3 reaches the catch point before 2 has the ball');
  });

  it('does not warn when the receiver starts after the previous pass', () => {
    expect(warnings(overlap({ pass: 'p1' })).filter((w) => w.kind === 'early')).toEqual([]);
  });

  it('is cleared by starting the run after the previous pass', () => {
    const fixed = applyEdit(overlap(), { type: 'startAfterPass', marker: 'a3', pass: 'p1' });
    if (typeof fixed === 'string') throw new Error(fixed);
    expect(fixed.base.moves.find((m) => m.marker === 'a3')?.after).toEqual({ pass: 'p1' });
    expect(warnings(fixed).filter((w) => w.kind === 'early')).toEqual([]);
  });

  it('never warns for the first pass of a ball', () => {
    expect(warnings(overlap()).filter((w) => w.pass === 'p1')).toEqual([]);
  });
});

describe('kicks', () => {
  /** a1 holds the ball at (10,20) and passes or kicks 16 m up to defender d1 at (10,4), who then passes to d2. */
  function kickScript(kick: boolean, d2: { x: number; y: number }) {
    const input = {
      schemaVersion: 1,
      area: { width: 30, length: 30 },
      direction: 'up',
      markers: [
        { id: 'a1', kind: 'attacker' },
        { id: 'd1', kind: 'defender' },
        { id: 'd2', kind: 'defender' },
        { id: 'ball', kind: 'ball' },
      ],
      base: {
        placements: [
          { marker: 'a1', cell: { x: 10, y: 20 } },
          { marker: 'd1', cell: { x: 10, y: 4 } },
          { marker: 'd2', cell: d2 },
          { marker: 'ball', holder: 'a1' },
        ],
        passes: [
          { id: 'p1', from: 'a1', to: 'd1', ...(kick && { kick: true }) },
          { id: 'p2', from: 'd1', to: 'd2' },
        ],
      },
    };
    const result = validate(input);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    return result.script;
  }

  it('flies slower than a pass of the same length', () => {
    const flightOf = (kick: boolean) => positionsAt(resolveStep(kickScript(kick, { x: 5, y: 4 }), 0), 0).passes[0];
    const pass = flightOf(false);
    const kick = flightOf(true);
    expect(kick.kick).toBe(true);
    expect(pass.kick).toBeUndefined();
    expect(kick.land - kick.fire).toBeCloseTo(16 / KICK_SPEED_MPS);
    expect(kick.land - kick.fire).toBeGreaterThan(pass.land - pass.fire);
  });

  it('is never a forward pass', () => {
    expect(warnings(kickScript(false, { x: 5, y: 4 })).map((w) => w.pass)).toEqual(['p1']);
    expect(warnings(kickScript(true, { x: 5, y: 4 }))).toEqual([]);
  });

  it('checks the receiving team in the opposite direction', () => {
    // Attack is up, so the defenders attack down: a pass to y 8 is forward for them, y 1 is backward.
    expect(warnings(kickScript(true, { x: 5, y: 1 }))).toEqual([]);
    expect(warnings(kickScript(true, { x: 5, y: 8 })).map((w) => w.pass)).toEqual(['p2']);
  });

  it('leaves scripts without kicks unchanged', () => {
    expect(warnings(script({ x: 10, y: 8 }, 'up')).map((w) => w.pass)).toEqual(['p1']);
  });

  it('is switched on and off by setKick', () => {
    const base = script({ x: 10, y: 14 });
    const kicked = applyEdit(base, { type: 'setKick', id: 'p1', kick: true });
    if (typeof kicked === 'string') throw new Error(kicked);
    expect(kicked.base.passes[0].kick).toBe(true);
    const plain = applyEdit(kicked, { type: 'setKick', id: 'p1', kick: false });
    if (typeof plain === 'string') throw new Error(plain);
    expect(plain.base.passes[0]).toEqual({ id: 'p1', from: 'a1', to: 'a2' });
  });
});
