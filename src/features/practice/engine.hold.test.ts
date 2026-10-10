import { describe, it, expect } from 'vitest';
import { validate, resolveStep, positionsAt, formatError, type Point, type ResolvedStep } from './engine';

/** Markers a1..a6 on a 40 x 30 Area; a1 holds the ball. `cells` overrides where each starts. */
function play(moves: unknown[], passes: unknown[] = [], cells: Record<string, { x: number; y: number }> = {}) {
  const start = { a1: { x: 5, y: 5 }, a2: { x: 10, y: 5 }, a3: { x: 15, y: 5 }, a4: { x: 8, y: 14 }, a5: { x: 8, y: 22 }, a6: { x: 30, y: 5 }, ...cells };
  return {
    schemaVersion: 1,
    area: { width: 40, length: 30 },
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'a3', kind: 'attacker' },
      { id: 'a4', kind: 'attacker' },
      { id: 'a5', kind: 'attacker' },
      { id: 'a6', kind: 'attacker' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        ...Object.entries(start).map(([marker, cell]) => ({ marker, cell })),
        { marker: 'ball', holder: 'a1' },
      ],
      moves,
      passes,
    },
  };
}

function stepOf(input: unknown): ResolvedStep {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, 0);
}

const errors = (input: unknown) => {
  const result = validate(input);
  return result.ok ? [] : result.errors.map(formatError);
};

const at = (step: ResolvedStep, id: string, t: number): Point => positionsAt(step, t).positions[id];
const near = (a: Point, b: Point, within = 0.03) => Math.hypot(a.x - b.x, a.y - b.y) < within;

/** The first moment from `from` that `id` is on `cell`. */
function arrival(step: ResolvedStep, id: string, cell: Point, from = 0): number {
  const { duration } = positionsAt(step, 0);
  for (let t = from; t <= duration + 1; t += 0.0025) if (near(at(step, id, t), cell, 0.004)) return t;
  throw new Error(`${id} never reaches ${cell.x}, ${cell.y}`);
}

/** The first moment after `from` that `id` is off `cell`. */
function leaves(step: ResolvedStep, id: string, cell: Point, from = 0): number {
  const { duration } = positionsAt(step, 0);
  for (let t = from; t <= duration + 1; t += 0.0025) if (!near(at(step, id, t), cell, 0.004)) return t;
  throw new Error(`${id} never leaves ${cell.x}, ${cell.y}`);
}

describe('hold: schema and validate', () => {
  const RUN = (hold: unknown) => ({ marker: 'a2', waypoints: [{ x: 10, y: 9 }, { x: 10, y: 9 + 4, ...(hold ? { hold } : {}) }, { x: 10, y: 5 }] });

  it('takes a hold on any waypoint, as many as the run has', () => {
    const move = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { move: 'a3' } }, { x: 10, y: 13, hold: { reach: { marker: 'a3', waypoint: 0 } } }, { x: 10, y: 5 }] };
    const other = { marker: 'a3', waypoints: [{ x: 15, y: 9 }] };
    expect(validate(play([move, other])).ok).toBe(true);
  });

  it('keeps scripts without holds valid', () => {
    expect(validate(play([{ marker: 'a2', waypoints: [{ x: 10, y: 9 }] }])).ok).toBe(true);
  });

  it('wants exactly one of move, pass or reach, and no unknown keys', () => {
    expect(errors(play([{ marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { move: 'a3', pass: 'p1' } }] }, { marker: 'a3', waypoints: [{ x: 15, y: 9 }] }]))).toEqual([
      'base.moves[0].waypoints[0].hold: give exactly one of "move" or "pass"',
    ]);
    expect(validate(play([{ marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { seconds: 3 } }] }])).ok).toBe(false);
  });

  it('refuses a hold on a marker with no move, an unknown pass and a waypoint the move does not have', () => {
    expect(errors(play([RUN({ move: 'a3' })]))).toEqual(['base.moves[0].waypoints[1].hold.move: marker "a3" has no move in this Step']);
    expect(errors(play([RUN({ pass: 'nope' })]))).toEqual(['base.moves[0].waypoints[1].hold.pass: no pass "nope" in this Step']);
    const other = { marker: 'a3', waypoints: [{ x: 15, y: 9 }] };
    expect(errors(play([RUN({ reach: { marker: 'a3', waypoint: 3 } }), other]))).toEqual([
      'base.moves[0].waypoints[1].hold.reach: waypoint 3 is outside the move of "a3", which has 1 waypoint (0)',
    ]);
  });

  it('refuses a hold that waits on the end of its own run, or on a waypoint after it', () => {
    expect(errors(play([RUN({ move: 'a2' })]))[0]).toContain('in a loop');
    expect(errors(play([RUN({ reach: { marker: 'a2', waypoint: 2 } })]))[0]).toContain('in a loop');
  });

  it('allows a hold on a reach at its own waypoint or an earlier one, which are over on arrival', () => {
    expect(validate(play([RUN({ reach: { marker: 'a2', waypoint: 1 } })])).ok).toBe(true);
    expect(validate(play([RUN({ reach: { marker: 'a2', waypoint: 0 } })])).ok).toBe(true);
  });

  it('refuses two runs that hold for each other past the waypoint they wait on', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { reach: { marker: 'a3', waypoint: 1 } } }, { x: 10, y: 13 }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 9, hold: { reach: { marker: 'a2', waypoint: 1 } } }, { x: 15, y: 13 }] };
    const [message] = errors(play([a2, a3]));
    expect(message).toContain('wait on each other in a loop');
    expect(message).toMatch(/^base\.moves\[\d\]\.waypoints\[0\]\.hold: /);
  });

  it('allows two runs that hold for each other on arrival, because reach fires before the hold', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { reach: { marker: 'a3', waypoint: 0 } } }, { x: 10, y: 13 }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 9, hold: { reach: { marker: 'a2', waypoint: 0 } } }, { x: 15, y: 13 }] };
    expect(validate(play([a2, a3])).ok).toBe(true);
    const step = stepOf(play([a2, a3]));
    const both = Math.max(arrival(step, 'a2', { x: 10, y: 9 }), arrival(step, 'a3', { x: 15, y: 9 }));
    expect(leaves(step, 'a2', { x: 10, y: 9 }, both - 0.01)).toBeGreaterThanOrEqual(both - 0.01);
    expect(arrival(step, 'a2', { x: 10, y: 13 })).toBeGreaterThan(both);
  });

  it('refuses a hold that waits on a pass the same player catches further on', () => {
    const move = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { pass: 'p1' } }, { x: 10, y: 13 }] };
    expect(errors(play([move], [{ id: 'p1', from: 'a1', to: 'a2' }]))[0]).toContain('in a loop');
  });

  it('allows a hold that waits on the pass caught at that waypoint: the catch comes first', () => {
    const move = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { pass: 'p1' } }, { x: 10, y: 13 }] };
    expect(validate(play([move], [{ id: 'p1', from: 'a1', to: 'a2', at: 0 }])).ok).toBe(true);
  });
});

describe('hold: timing', () => {
  it('stands on the waypoint until the event, then runs the rest', () => {
    // a2 runs 4 cells to its hold and waits for a3's longer run to end, then returns.
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { move: 'a3' } }, { x: 10, y: 6 }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 25 }] };
    const step = stepOf(play([a2, a3]));
    const arrived = arrival(step, 'a2', { x: 10, y: 9 });
    const released = arrival(step, 'a3', { x: 15, y: 25 });
    expect(released).toBeGreaterThan(arrived + 1);
    for (const t of [arrived + 0.3, (arrived + released) / 2, released - 0.05]) expect(near(at(step, 'a2', t), { x: 10, y: 9 })).toBe(true);
    expect(leaves(step, 'a2', { x: 10, y: 9 }, arrived)).toBeGreaterThanOrEqual(released - 0.1);
    expect(arrival(step, 'a2', { x: 10, y: 6 }, released)).toBeGreaterThan(released);
  });

  it('does not wait when the event has already happened on arrival', () => {
    const quick = { marker: 'a3', waypoints: [{ x: 15, y: 6 }] };
    const held = stepOf(play([{ marker: 'a2', waypoints: [{ x: 10, y: 25, hold: { move: 'a3' } }, { x: 10, y: 29 }] }, quick]));
    const free = stepOf(play([{ marker: 'a2', waypoints: [{ x: 10, y: 25 }, { x: 10, y: 29 }] }, quick]));
    // A hold at a stop and go: the player comes to rest and sets off again, so the Run is a little slower than without.
    const heldEnd = arrival(held, 'a2', { x: 10, y: 29 });
    const freeEnd = arrival(free, 'a2', { x: 10, y: 29 });
    expect(heldEnd).toBeGreaterThanOrEqual(freeEnd - 0.01);
    expect(heldEnd).toBeLessThan(freeEnd + 3);
  });

  it('holds on the last waypoint until the event, and move waits on the run include that hold', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { move: 'a3' } }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 25 }] };
    const a4 = { marker: 'a4', waypoints: [{ x: 8, y: 16 }], after: { move: 'a2' } };
    const step = stepOf(play([a2, a3, a4]));
    const a3Ends = arrival(step, 'a3', { x: 15, y: 25 });
    expect(leaves(step, 'a4', { x: 8, y: 14 })).toBeGreaterThanOrEqual(a3Ends - 0.05);
  });

  it('fires reach on arrival, before the hold at that waypoint', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { move: 'a3' } }, { x: 10, y: 6 }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 25 }] };
    const a4 = { marker: 'a4', waypoints: [{ x: 8, y: 16 }], after: { reach: { marker: 'a2', waypoint: 0 } } };
    const step = stepOf(play([a2, a3, a4]));
    expect(Math.abs(leaves(step, 'a4', { x: 8, y: 14 }) - arrival(step, 'a2', { x: 10, y: 9 }))).toBeLessThan(0.25);
  });

  it('lets a later reach wait for the hold before it', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 9, hold: { move: 'a3' } }, { x: 10, y: 6 }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 25 }] };
    const a4 = { marker: 'a4', waypoints: [{ x: 8, y: 16 }], after: { reach: { marker: 'a2', waypoint: 1 } } };
    const step = stepOf(play([a2, a3, a4]));
    expect(Math.abs(leaves(step, 'a4', { x: 8, y: 14 }) - arrival(step, 'a2', { x: 10, y: 6 }, 3))).toBeLessThan(0.25);
    expect(leaves(step, 'a4', { x: 8, y: 14 })).toBeGreaterThan(arrival(step, 'a3', { x: 15, y: 25 }));
  });
});

describe('hold: a ruck', () => {
  // a1 runs to the shield (5, 12) and holds there with the ball until p2 is caught, then resets.
  // a2 and a3 run to the ruck and hold until p2 is caught, then walk back.
  // a4 (the scrum-half) takes the ball from a1 and passes to a5. p1 waits on a3 reaching the ruck, p2 on a2.
  const a1 = { marker: 'a1', waypoints: [{ x: 5, y: 12, hold: { pass: 'p2' } }, { x: 5, y: 5, pace: 'walk' }] };
  const a2 = { marker: 'a2', waypoints: [{ x: 9, y: 12, hold: { pass: 'p2' } }, { x: 10, y: 5, pace: 'walk' }] };
  const a3 = { marker: 'a3', waypoints: [{ x: 12, y: 13, hold: { pass: 'p2' } }, { x: 15, y: 5, pace: 'walk' }] };
  const p1 = { id: 'p1', from: 'a1', to: 'a4', release: 0, after: { reach: { marker: 'a3', waypoint: 0 } } };
  const p2 = { id: 'p2', from: 'a4', to: 'a5', after: { reach: { marker: 'a2', waypoint: 0 } } };
  const script = () => play([a1, a2, a3], [p1, p2]);

  it('is valid', () => {
    expect(errors(script())).toEqual([]);
  });

  it('keeps the carrier and the supports at the ruck until the ball is cleared, then sends them back', () => {
    const step = stepOf(script());
    const { passes } = positionsAt(step, 0);
    const [first, second] = passes;
    const shield = { x: 5, y: 12 };
    const cleared = second.land;
    // Everyone is at the ruck before the first pass goes.
    const there = Math.max(arrival(step, 'a1', shield), arrival(step, 'a2', { x: 9, y: 12 }), arrival(step, 'a3', { x: 12, y: 13 }));
    expect(first.fire).toBeGreaterThanOrEqual(there - 0.05);
    expect(second.fire).toBeGreaterThanOrEqual(first.land - 1e-6);
    // They stand until the second pass is caught.
    for (const [id, cell] of [['a1', shield], ['a2', { x: 9, y: 12 }], ['a3', { x: 12, y: 13 }]] as const) {
      for (const t of [there + 0.1, (there + cleared) / 2, cleared - 0.05]) expect(near(at(step, id, t), cell)).toBe(true);
      expect(leaves(step, id, cell, there)).toBeGreaterThanOrEqual(cleared - 0.05);
      expect(arrival(step, id, step.markers.find((m) => m.id === id)!.cell, there + 0.5)).toBeGreaterThan(cleared);
    }
  });

  it('lets the carrier pass the ball on from where it holds', () => {
    const step = stepOf(script());
    const { passes } = positionsAt(step, 0);
    expect(near(passes[0].start, { x: 5, y: 12 }, 0.05)).toBe(true);
    expect(near(passes[1].start, { x: 8, y: 14 }, 0.05)).toBe(true);
    // a1 does not have the ball once it is released, though it stays at the shield.
  });

  it('fires the first pass only when the support has reached the ruck (the pass waits on one event)', () => {
    const slowSupport = { marker: 'a3', waypoints: [{ x: 12, y: 13, hold: { pass: 'p2' }, pace: 'walk' }, { x: 15, y: 5, pace: 'walk' }] };
    const step = stepOf(play([a1, a2, slowSupport], [p1, p2]));
    const { passes } = positionsAt(step, 0);
    expect(Math.abs(passes[0].fire - arrival(step, 'a3', { x: 12, y: 13 }))).toBeLessThan(0.1);
  });
});

describe('hold: receivers', () => {
  // a2 jogs to w0, holds there until a4's run ends, then runs on to w2 where a1's pass (held up by a3) finds it.
  const waypoints = (hold?: unknown) => [{ x: 10, y: 9, ...(hold ? { hold } : {}) }, { x: 10, y: 11 }, { x: 10, y: 13 }];
  const a4 = { marker: 'a4', waypoints: [{ x: 8, y: 16 }] };
  const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 29 }] };
  const pass = { id: 'p1', from: 'a1', to: 'a2', at: 2, after: { move: 'a3' } };

  it('slows only the stretch after the last hold, so earlier stretches keep their Pace', () => {
    const held = { marker: 'a2', waypoints: waypoints({ move: 'a4' }) };
    const untimed = stepOf(play([held, a4, a3]));
    const timed = stepOf(play([held, a4, a3], [pass]));
    // Before the hold: unchanged. After it: slowed to meet the ball.
    expect(arrival(timed, 'a2', { x: 10, y: 9 })).toBeCloseTo(arrival(untimed, 'a2', { x: 10, y: 9 }), 2);
    const land = positionsAt(timed, 0).passes[0].land;
    expect(arrival(timed, 'a2', { x: 10, y: 13 })).toBeGreaterThan(arrival(untimed, 'a2', { x: 10, y: 13 }) + 1);
    expect(arrival(timed, 'a2', { x: 10, y: 13 })).toBeLessThanOrEqual(land + 0.01);
  });

  it('slows the whole run when there is no hold, as before', () => {
    const free = { marker: 'a2', waypoints: waypoints() };
    const untimed = stepOf(play([free, a4, a3]));
    const timed = stepOf(play([free, a4, a3], [pass]));
    expect(arrival(timed, 'a2', { x: 10, y: 9 })).toBeGreaterThan(arrival(untimed, 'a2', { x: 10, y: 9 }) + 0.2);
  });

  it('does not slow a stretch after the catch', () => {
    // Caught at w1: w2 onwards (after a hold at w1) runs at its own Pace.
    const move = { marker: 'a2', waypoints: [{ x: 10, y: 9 }, { x: 10, y: 11, hold: { move: 'a4' } }, { x: 10, y: 13 }] };
    const catchEarly = { id: 'p1', from: 'a1', to: 'a2', at: 1, after: { move: 'a3' } };
    const timed = stepOf(play([move, a4, a3], [catchEarly]));
    const untimed = stepOf(play([move, a4, a3]));
    const land = positionsAt(timed, 0).passes[0].land;
    expect(arrival(timed, 'a2', { x: 10, y: 11 })).toBeGreaterThan(arrival(untimed, 'a2', { x: 10, y: 11 }) + 1);
    expect(arrival(timed, 'a2', { x: 10, y: 11 })).toBeLessThanOrEqual(land + 0.01);
    // The hold has long been over by the catch, so the last stretch runs from the catch at its own Pace.
    const leave = leaves(timed, 'a2', { x: 10, y: 11 }, land - 0.001);
    expect(arrival(timed, 'a2', { x: 10, y: 13 }) - leave).toBeCloseTo(arrival(untimed, 'a2', { x: 10, y: 13 }) - leaves(untimed, 'a2', { x: 10, y: 11 }, arrival(untimed, 'a2', { x: 10, y: 11 })), 1);
  });

  it('waits for a hold to end before the ball can be caught after it', () => {
    // The pass is ready at once, but a2 cannot reach w2 before a3 ends: the ball goes late, from where the passer has run to.
    const slowHold = { marker: 'a2', waypoints: waypoints({ move: 'a3' }) };
    const early = { id: 'p1', from: 'a1', to: 'a2', at: 2 };
    const step = stepOf(play([slowHold, a3], [early]));
    const { passes } = positionsAt(step, 0);
    expect(passes[0].land).toBeCloseTo(arrival(step, 'a2', { x: 10, y: 13 }), 0);
    expect(passes[0].fire).toBeGreaterThan(1);
  });
});

describe('hold: waits that need care', () => {
  it('validates and plays a pass that waits on a hold-ing player reaching the hold waypoint, which holds until that same pass', () => {
    // 4's pass p waits on a2 reaching waypoint 1; a2 holds at waypoint 1 until p is caught, then walks back.
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 11, hold: { pass: 'p' } }, { x: 10, y: 5, pace: 'walk' }] };
    const p = { id: 'p', from: 'a1', to: 'a5', after: { reach: { marker: 'a2', waypoint: 1 } } };
    expect(errors(play([a2], [p]))).toEqual([]);
    const step = stepOf(play([a2], [p]));
    const { passes } = positionsAt(step, 0);
    const arrived = arrival(step, 'a2', { x: 10, y: 11 });
    expect(Math.abs(passes[0].fire - arrived)).toBeLessThan(0.1);
    expect(near(at(step, 'a2', (arrived + passes[0].land) / 2), { x: 10, y: 11 })).toBe(true);
    expect(leaves(step, 'a2', { x: 10, y: 11 }, arrived)).toBeGreaterThanOrEqual(passes[0].land - 0.05);
  });

  it('refuses the same shape when the pass waits for the end of the run instead', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 11, hold: { pass: 'p' } }, { x: 10, y: 5, pace: 'walk' }] };
    const p = { id: 'p', from: 'a1', to: 'a5', after: { move: 'a2' } };
    expect(errors(play([a2], [p]))[0]).toContain('in a loop');
  });

  it('leaves a receiver untimed when the ball waits on an arrival that the timing would delay', () => {
    // a2 would be slowed to meet p1, but a1's run (and so p1) waits for a2 reaching its first point: a real loop, so no timing.
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 11 }] };
    const a1 = { marker: 'a1', waypoints: [{ x: 5, y: 9 }], after: { reach: { marker: 'a2', waypoint: 0 } } };
    const p1 = { id: 'p1', from: 'a1', to: 'a2', at: 1, after: { move: 'a3' } };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 25 }] };
    expect(errors(play([a1, a2, a3], [p1]))).toEqual([]);
    expect(() => positionsAt(stepOf(play([a1, a2, a3], [p1])), 1)).not.toThrow();
  });

  it('plays a collector or receiver with a hold on its last waypoint without crashing', () => {
    const a2 = { marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 11, hold: { move: 'a3' } }] };
    const a3 = { marker: 'a3', waypoints: [{ x: 15, y: 20 }] };
    const p1 = { id: 'p1', from: 'a1', to: 'a2' };
    const step = stepOf(play([a2, a3], [p1]));
    const { duration } = positionsAt(step, 0);
    expect(duration).toBeGreaterThanOrEqual(arrival(step, 'a3', { x: 15, y: 20 }));
  });
});
