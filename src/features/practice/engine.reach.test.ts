import { describe, it, expect } from 'vitest';
import { validate, resolveStep, positionsAt, formatError, type Point, type ResolvedStep } from './engine';
import { waitOptions } from './editing';
import type { PracticeScript } from './schema';

/** a1 holds the ball at (0, 0); a2 (10, 0), a3 (20, 0) and a4 (30, 0) are free. */
function play(moves: unknown[], passes: unknown[] = []) {
  return {
    schemaVersion: 1,
    area: { width: 40, length: 30 },
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'a3', kind: 'attacker' },
      { id: 'a4', kind: 'attacker' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 0, y: 0 } },
        { marker: 'a2', cell: { x: 10, y: 0 } },
        { marker: 'a3', cell: { x: 20, y: 0 } },
        { marker: 'a4', cell: { x: 30, y: 0 } },
        { marker: 'ball', holder: 'a1' },
      ],
      moves,
      passes,
    },
  };
}

const RUN_A2 = { marker: 'a2', waypoints: [{ x: 10, y: 4 }, { x: 10, y: 8 }, { x: 10, y: 12 }, { x: 10, y: 16 }] };

function stepOf(input: unknown): ResolvedStep {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, 0);
}

const near = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) < 0.05;

/** The first moment marker `id` is on `cell`, scanning the Step. */
function arrival(step: ResolvedStep, id: string, cell: Point): number {
  const { duration } = positionsAt(step, 0);
  for (let t = 0; t <= duration; t += 0.005) {
    if (near(positionsAt(step, t).positions[id], cell)) return t;
  }
  throw new Error(`${id} never reaches ${cell.x}, ${cell.y}`);
}

/** The first moment marker `id` is off its starting cell. */
function setOff(step: ResolvedStep, id: string): number {
  const start = positionsAt(step, 0).positions[id];
  const { duration } = positionsAt(step, 0);
  for (let t = 0; t <= duration; t += 0.005) {
    const now = positionsAt(step, t).positions[id];
    if (Math.hypot(now.x - start.x, now.y - start.y) > 1e-4) return t;
  }
  throw new Error(`${id} never sets off`);
}

const errors = (input: unknown) => {
  const result = validate(input);
  return result.ok ? [] : result.errors.map(formatError);
};

describe('reach wait: schema', () => {
  it('takes a reach on a run and on a pass, and a pass can now wait on a pass', () => {
    const moves = [RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 1 } } }];
    const passes = [
      { id: 'p1', from: 'a1', to: 'a4', after: { reach: { marker: 'a2', waypoint: 2 } } },
      { id: 'p2', from: 'a4', to: 'a1', after: { pass: 'p1' } },
    ];
    expect(validate(play(moves, passes)).ok).toBe(true);
  });

  it('keeps old scripts valid: a pass still takes just a move', () => {
    expect(validate(play([RUN_A2], [{ id: 'p1', from: 'a1', to: 'a3', after: { move: 'a2' } }])).ok).toBe(true);
  });

  it('wants exactly one of move, pass or reach', () => {
    const both = { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { move: 'a2', reach: { marker: 'a2', waypoint: 0 } } };
    expect(errors(play([RUN_A2, both]))).toEqual(['base.moves[1].after: give exactly one of "move", "pass" or "reach"']);
  });

  it('refuses a negative or fractional waypoint and unknown keys in a reach', () => {
    for (const reach of [{ marker: 'a2', waypoint: -1 }, { marker: 'a2', waypoint: 0.5 }, { marker: 'a2', waypoint: 0, extra: 1 }]) {
      const moves = [RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach } }];
      expect(validate(play(moves)).ok).toBe(false);
    }
  });
});

describe('reach wait: validate', () => {
  it('refuses a marker with no move in the Step', () => {
    const moves = [{ marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 0 } } }];
    expect(errors(play(moves))).toEqual(['base.moves[0].after.reach: marker "a2" has no move in this Step, so it cannot reach a waypoint']);
  });

  it('refuses a waypoint the move does not have, for a run and a pass', () => {
    const moves = [RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 4 } } }];
    expect(errors(play(moves))).toEqual([
      'base.moves[1].after.reach: waypoint 4 is outside the move of "a2", which has 4 waypoints (0-3)',
    ]);
    const pass = { id: 'p1', from: 'a1', to: 'a3', after: { reach: { marker: 'a2', waypoint: 9 } } };
    expect(errors(play([RUN_A2], [pass]))).toEqual([
      'base.passes[0].after.reach: waypoint 9 is outside the move of "a2", which has 4 waypoints (0-3)',
    ]);
  });

  it('refuses waits that loop through a reach', () => {
    const moves = [
      { marker: 'a2', waypoints: [{ x: 10, y: 4 }, { x: 10, y: 8 }, { x: 10, y: 12 }], after: { reach: { marker: 'a3', waypoint: 0 } } },
      { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { move: 'a2' } },
    ];
    const [message] = errors(play(moves));
    expect(message).toContain('wait on each other in a loop');
  });

  it('refuses a run that waits on its own waypoint', () => {
    const moves = [{ ...RUN_A2, after: { reach: { marker: 'a2', waypoint: 1 } } }];
    expect(errors(play(moves))[0]).toContain('in a loop');
  });

  it('allows a run to wait on an early waypoint of a run that waits on it only after that point', () => {
    // a3 starts when a2 is at point 1; a2 has no wait, so nothing loops.
    const moves = [RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 1 } } }];
    expect(validate(play(moves)).ok).toBe(true);
  });
});

describe('reach wait: timing', () => {
  it('fires a pass as the marker arrives at the waypoint', () => {
    const pass = { id: 'p1', from: 'a1', to: 'a3', after: { reach: { marker: 'a2', waypoint: 1 } } };
    const step = stepOf(play([RUN_A2], [pass]));
    const { passes } = positionsAt(step, 0);
    expect(passes[0].fire).toBeCloseTo(arrival(step, 'a2', { x: 10, y: 8 }), 1);
    expect(passes[0].fire).toBeGreaterThan(0.5);
  });

  it('starts a run as the marker arrives at the waypoint', () => {
    const moves = [RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 2 } } }];
    const step = stepOf(play(moves));
    expect(setOff(step, 'a3')).toBeCloseTo(arrival(step, 'a2', { x: 10, y: 12 }), 1);
  });

  it('lets one player trigger two actions from two waypoints', () => {
    const moves = [RUN_A2, { marker: 'a4', waypoints: [{ x: 30, y: 5 }], after: { reach: { marker: 'a2', waypoint: 0 } } }];
    const pass = { id: 'p1', from: 'a1', to: 'a3', after: { reach: { marker: 'a2', waypoint: 2 } } };
    const step = stepOf(play(moves, [pass]));
    const early = arrival(step, 'a2', { x: 10, y: 4 });
    const late = arrival(step, 'a2', { x: 10, y: 12 });
    expect(late).toBeGreaterThan(early + 0.5);
    expect(setOff(step, 'a4')).toBeCloseTo(early, 1);
    expect(positionsAt(step, 0).passes[0].fire).toBeCloseTo(late, 1);
  });

  it('fires on arrival, not when the whole run ends', () => {
    const viaMove = stepOf(play([RUN_A2], [{ id: 'p1', from: 'a1', to: 'a3', after: { move: 'a2' } }]));
    const viaReach = stepOf(play([RUN_A2], [{ id: 'p1', from: 'a1', to: 'a3', after: { reach: { marker: 'a2', waypoint: 1 } } }]));
    expect(positionsAt(viaReach, 0).passes[0].fire).toBeLessThan(positionsAt(viaMove, 0).passes[0].fire);
  });

  it('uses the slowed run of a receiver timed to a ball', () => {
    // a2 would reach point 0 early, but the pass waits for a4's long run, so a2 is slowed to catch it at point 1.
    const receiver = { marker: 'a2', waypoints: [{ x: 10, y: 1 }, { x: 10, y: 3 }] };
    const follower = { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 0 } } };
    const pass = { id: 'p1', from: 'a1', to: 'a2', at: 1, after: { move: 'a4' } };
    const long = { marker: 'a4', waypoints: [{ x: 30, y: 25 }] };
    const natural = stepOf(play([receiver, follower, long]));
    const timed = stepOf(play([receiver, follower, long], [pass]));
    const naturalStart = setOff(natural, 'a3');
    const timedStart = setOff(timed, 'a3');
    expect(timedStart).toBeCloseTo(arrival(timed, 'a2', { x: 10, y: 1 }), 0);
    expect(timedStart).toBeGreaterThan(naturalStart + 0.1);
  });

  it('refuses nothing when timing a receiver would loop through a reach: the run is just not timed', () => {
    // a2 catches from a1, but the pass waits on a3 reaching a point, and a3 waits on a2 reaching one.
    const receiver = { marker: 'a2', waypoints: [{ x: 10, y: 1 }, { x: 10, y: 3 }], after: { reach: { marker: 'a3', waypoint: 0 } } };
    const other = { marker: 'a3', waypoints: [{ x: 20, y: 5 }] };
    const pass = { id: 'p1', from: 'a1', to: 'a2', at: 1 };
    expect(() => stepOf(play([receiver, other], [pass]))).not.toThrow();
  });
});

describe('reach wait: depends on the run starting, not the whole run', () => {
  it('lets the passer set off when its receiver reaches an early waypoint', () => {
    // a1 passes to a2, and a1's own run waits on a2 reaching point 0: a2 does not wait for the whole of a1's run.
    const receiver = { marker: 'a2', waypoints: [{ x: 10, y: 1 }, { x: 10, y: 3 }] };
    const passer = { marker: 'a1', waypoints: [{ x: 0, y: 5 }], after: { reach: { marker: 'a2', waypoint: 0 } } };
    const pass = { id: 'p1', from: 'a1', to: 'a2', at: 1 };
    const step = stepOf(play([receiver, passer], [pass]));
    expect(setOff(step, 'a1')).toBeCloseTo(arrival(step, 'a2', { x: 10, y: 1 }), 1);
  });

  it('does not time a receiver that the ball itself waits on through a reach (a real loop), and plays it at its own Paces', () => {
    // a2 would be slowed to meet p1, but p1 waits on a3, which waits on a2 reaching point 0: timing a2 would loop.
    const receiver = { marker: 'a2', waypoints: [{ x: 10, y: 1 }, { x: 10, y: 3 }] };
    const other = { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 0 } } };
    const pass = { id: 'p1', from: 'a1', to: 'a2', at: 1, after: { move: 'a3' } };
    const untouched = stepOf(play([receiver, other]));
    const step = stepOf(play([receiver, other], [pass]));
    expect(arrival(step, 'a2', { x: 10, y: 3 })).toBeCloseTo(arrival(untouched, 'a2', { x: 10, y: 3 }), 1);
    expect(positionsAt(step, 0).passes[0].fire).toBeGreaterThan(0);
  });

  it('still times a receiver that nobody waits on through a reach', () => {
    const receiver = { marker: 'a2', waypoints: [{ x: 10, y: 1 }, { x: 10, y: 3 }] };
    const slow = { marker: 'a4', waypoints: [{ x: 30, y: 25 }] };
    const pass = { id: 'p1', from: 'a1', to: 'a2', at: 1, after: { move: 'a4' } };
    const untouched = stepOf(play([receiver, slow]));
    const step = stepOf(play([receiver, slow], [pass]));
    // The ball is held up by a4's long run, so a2 is slowed to meet it.
    expect(arrival(step, 'a2', { x: 10, y: 3 })).toBeGreaterThan(arrival(untouched, 'a2', { x: 10, y: 3 }) + 1);
  });
});

describe('reach wait: picker options', () => {
  const scriptOf = (input: unknown): { script: PracticeScript; step: ResolvedStep } => {
    const result = validate(input);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    return { script: result.script, step: resolveStep(result.script, 0) };
  };

  it('offers a run every other move and reach, but not itself', () => {
    const { script, step } = scriptOf(play([RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }, { x: 20, y: 9 }] }]));
    const options = waitOptions(script, step, { move: 'a3' });
    expect(options).toContainEqual({ move: 'a2' });
    expect(options).toContainEqual({ reach: { marker: 'a2', waypoint: 3 } });
    expect(options.some((w) => w.move === 'a3' || w.reach?.marker === 'a3')).toBe(false);
  });

  it('leaves out any choice that would make waits loop', () => {
    const moves = [
      RUN_A2,
      { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 0 } } },
      { marker: 'a4', waypoints: [{ x: 30, y: 5 }] },
    ];
    const { script, step } = scriptOf(play(moves));
    const options = waitOptions(script, step, { move: 'a2' });
    // a3 waits on a2, so a2 cannot wait on a3 in any way.
    expect(options.some((w) => w.move === 'a3' || w.reach?.marker === 'a3')).toBe(false);
    expect(options).toContainEqual({ move: 'a4' });
    expect(options).toContainEqual({ reach: { marker: 'a4', waypoint: 0 } });
  });

  it('leaves out the wait a run already has, and offers a pass its choices', () => {
    const moves = [RUN_A2, { marker: 'a3', waypoints: [{ x: 20, y: 5 }], after: { reach: { marker: 'a2', waypoint: 1 } } }];
    const { script, step } = scriptOf(play(moves, [{ id: 'p1', from: 'a1', to: 'a4' }]));
    const run = waitOptions(script, step, { move: 'a3' });
    expect(run).not.toContainEqual({ reach: { marker: 'a2', waypoint: 1 } });
    expect(run).toContainEqual({ reach: { marker: 'a2', waypoint: 2 } });
    const pass = waitOptions(script, step, { pass: 'p1' }, ['move', 'reach']);
    expect(pass).toContainEqual({ reach: { marker: 'a3', waypoint: 0 } });
    expect(pass.some((w) => w.pass !== undefined)).toBe(false);
  });
});
