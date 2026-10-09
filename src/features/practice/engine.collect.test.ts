import { describe, it, expect } from 'vitest';
import {
  formatError,
  KICK_ROLL_S,
  looseBalls,
  PACE_SPEEDS_MPS,
  positionsAt,
  resolveStep,
  validate,
  warnings,
  type Point,
} from './engine';
import type { PracticeScript } from './schema';

function errorsOf(input: unknown): string[] {
  const result = validate(input);
  if (result.ok) throw new Error('expected validation to fail');
  return result.errors.map(formatError);
}

function valid(input: unknown): PracticeScript {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return result.script;
}

type Base = { placements?: unknown[]; moves?: unknown[]; passes?: unknown[] };

/**
 * A 20 x 20 Area attacking up: a1 holds the ball at (10, 15), a2 stands at (4, 15),
 * d1 at (10, 2) and d2 at (14, 2). ball2 starts loose on (2, 2), off to one side.
 */
function field(base: Base = {}, progressions: unknown[] = []) {
  const placements = (base.placements ?? [
    { marker: 'a1', cell: { x: 10, y: 15 } },
    { marker: 'a2', cell: { x: 4, y: 15 } },
    { marker: 'd1', cell: { x: 10, y: 2 } },
    { marker: 'd2', cell: { x: 14, y: 2 } },
    { marker: 'ball', holder: 'a1' },
  ]) as Array<{ marker: string }>;
  const markers = [
    { id: 'a1', kind: 'attacker' },
    { id: 'a2', kind: 'attacker' },
    { id: 'd1', kind: 'defender' },
    { id: 'd2', kind: 'defender' },
    { id: 'ball', kind: 'ball' },
    { id: 'ball2', kind: 'ball' },
  ];
  return {
    schemaVersion: 1,
    area: { width: 20, length: 20 },
    direction: 'up',
    // Only the markers this fixture places.
    markers: markers.filter((m) => placements.some((p) => p.marker === m.id)),
    base: {
      placements,
      moves: base.moves ?? [],
      passes: base.passes ?? [],
    },
    progressions,
  };
}

/** a1 kicks up to (10, 5); the ball rolls on and comes to rest on (10, 3). */
const kick = { id: 'k1', from: 'a1', cell: { x: 10, y: 5 }, kick: true };
const REST = { x: 10, y: 3 };
const stepOf = (input: unknown, n = 0) => resolveStep(valid(input), n);
const near = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) < 1e-6;

describe('Collect a loose ball (ADR 0006)', () => {
  it('takes the ball when the collector reaches it, then passes on as normal', () => {
    // a2 sprints from (4, 15) to the ball, collects it and passes back to a1.
    const step = stepOf(field({
      moves: [{ marker: 'a2', waypoints: [REST], pace: 'sprint' }],
      passes: [kick, { id: 'p2', from: 'a2', to: 'a1' }],
    }));
    const { passes, duration } = positionsAt(step, 0);
    const [k1, p2] = passes;
    expect(k1.roll!.to).toEqual(REST);
    expect(p2.pickup).toBeDefined();
    expect(p2.pickup!).toBeGreaterThanOrEqual(k1.roll!.until - 1e-9);
    expect(p2.start).toEqual(REST);
    expect(p2.fire).toBeGreaterThanOrEqual(p2.pickup! - 1e-9);
    expect(positionsAt(step, p2.pickup!).positions.a2).toEqual(REST);
    expect(positionsAt(step, p2.land).positions.ball).toEqual({ x: 10, y: 15 });
    expect(positionsAt(step, duration).positions.ball).toEqual({ x: 10, y: 15 });
  });

  it('never picks the ball up before it comes to rest: an early collector is slowed to arrive as it does', () => {
    // d1 is a metre from where the ball stops: it would be there long before the kick lands.
    const step = stepOf(field({
      moves: [{ marker: 'd1', waypoints: [REST] }],
      passes: [kick, { id: 'p2', from: 'd1', to: 'd2' }],
    }));
    const [k1, p2] = positionsAt(step, 0).passes;
    expect(p2.pickup).toBeCloseTo(k1.roll!.until);
    expect(k1.roll!.until).toBeCloseTo(k1.land + KICK_ROLL_S);
    // Arrives with the ball, not before: nobody stands waiting on the cell.
    expect(near(positionsAt(step, p2.pickup! - 0.05).positions.d1, REST)).toBe(false);
    expect(positionsAt(step, p2.pickup!).positions.d1).toEqual(REST);
    // The ball lies loose until then and rides with d1 once collected.
    expect(positionsAt(step, (k1.roll!.until + k1.land) / 2).positions.ball).not.toEqual(REST);
    expect(positionsAt(step, k1.roll!.until).positions.ball).toEqual(REST);
  });

  it('slows the collector no further than walk on any segment, then starts it later', () => {
    const step = stepOf(field({
      moves: [{ marker: 'd1', waypoints: [REST], pace: 'walk' }],
      passes: [kick, { id: 'p2', from: 'd1', to: 'd2' }],
    }));
    const [k1, p2] = positionsAt(step, 0).passes;
    expect(p2.pickup).toBeCloseTo(k1.roll!.until);
    // A walk is never slowed: d1 stands on its cell, then walks the metre at walking Pace.
    expect(positionsAt(step, 0.5).positions.d1).toEqual({ x: 10, y: 2 });
    const walkOneMetre = stepOf(field({ moves: [{ marker: 'd1', waypoints: [REST], pace: 'walk' }] }));
    const alone = positionsAt(walkOneMetre, 0).duration;
    expect(PACE_SPEEDS_MPS.walk).toBe(1);
    expect(positionsAt(step, p2.pickup! - alone / 2).positions.d1.y).toBeCloseTo(positionsAt(walkOneMetre, alone / 2).positions.d1.y);
  });

  it('lets a late collector arrive later: the ball lies loose until they get there', () => {
    // a2 jogs from (4, 15): far slower than the kick.
    const step = stepOf(field({
      moves: [{ marker: 'a2', waypoints: [REST] }],
      passes: [kick, { id: 'p2', from: 'a2', to: 'a1' }],
    }));
    const [k1, p2] = positionsAt(step, 0).passes;
    expect(p2.pickup!).toBeGreaterThan(k1.roll!.until + 1);
    expect(positionsAt(step, p2.pickup! - 0.5).positions.ball).toEqual(REST);
    expect(near(positionsAt(step, p2.pickup! - 0.5).positions.a2, REST)).toBe(false);
    expect(p2.fire).toBeCloseTo(p2.pickup!);
  });

  it('collects a ball that starts loose as soon as the collector reaches it', () => {
    const step = stepOf(field({
      placements: [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 4, y: 15 } },
        { marker: 'ball', cell: { x: 4, y: 10 } },
      ],
      moves: [{ marker: 'a2', waypoints: [{ x: 4, y: 10 }] }],
      passes: [{ id: 'p1', from: 'a2', to: 'a1' }],
    }));
    const { passes } = positionsAt(step, 0);
    const alone = positionsAt(stepOf(field({
      placements: [{ marker: 'a2', cell: { x: 4, y: 15 } }, { marker: 'ball', holder: 'a2' }, { marker: 'a1', cell: { x: 10, y: 15 } }],
      moves: [{ marker: 'a2', waypoints: [{ x: 4, y: 10 }] }],
    })), 0).duration;
    // Not slowed: the ball was there all along.
    expect(passes[0].pickup).toBeCloseTo(alone);
    expect(positionsAt(step, 1).positions.ball).toEqual({ x: 4, y: 10 });
  });

  it('lets a kicker chase and collect their own kick', () => {
    // a1 releases the kick at (10, 13) and runs on to where it stops.
    const step = stepOf(field({
      moves: [{ marker: 'a1', waypoints: [{ x: 10, y: 13 }, REST], pace: 'sprint' }],
      passes: [{ ...kick, release: 0 }, { id: 'p2', from: 'a1', to: 'a2' }],
    }));
    const [k1, p2] = positionsAt(step, 0).passes;
    expect(k1.start).toEqual({ x: 10, y: 13 });
    expect(p2.pickup!).toBeGreaterThanOrEqual(k1.roll!.until - 1e-9);
    expect(p2.start).toEqual(REST);
  });

  it('flips the direction of attack when the other team collects', () => {
    // d1 collects an attacking kick. Defenders attack down: a pass from (10, 3) to (14, 1) is backward for them.
    const back = valid(field({
      moves: [{ marker: 'd1', waypoints: [REST] }, { marker: 'd2', waypoints: [{ x: 14, y: 1 }] }],
      passes: [kick, { id: 'p2', from: 'd1', to: 'd2' }],
    }));
    expect(warnings(back)).toEqual([]);
    const forward = valid(field({
      moves: [{ marker: 'd1', waypoints: [REST] }, { marker: 'd2', waypoints: [{ x: 14, y: 8 }] }],
      passes: [kick, { id: 'p2', from: 'd1', to: 'd2' }],
    }));
    expect(warnings(forward)).toEqual([{ step: 0, pass: 'p2', kind: 'forward', message: 'Pass 2 goes forward' }]);
    // The same pass up the field by attackers would go forward for them.
    const attackers = valid(field({
      placements: [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 14, y: 2 } },
        { marker: 'd1', cell: { x: 10, y: 2 } },
        { marker: 'ball', holder: 'a1' },
      ],
      moves: [{ marker: 'a1', waypoints: [{ x: 10, y: 13 }, REST], pace: 'sprint' }, { marker: 'a2', waypoints: [{ x: 14, y: 1 }] }],
      passes: [{ ...kick, release: 0 }, { id: 'p2', from: 'a1', to: 'a2' }],
    }));
    expect(warnings(attackers).map((w) => w.kind)).toEqual(['forward']);
  });

  it('warns when the next receiver reaches a catch on the run before the collector has the ball', () => {
    // a1 releases the kick on the run and runs on to receive: its Run cannot be
    // timed to a2's pass (where it kicks from depends on that Run), so it gets there first.
    const script = valid(field({
      moves: [
        { marker: 'a1', waypoints: [{ x: 10, y: 13 }, { x: 16, y: 13 }, { x: 16, y: 8 }] },
        { marker: 'a2', waypoints: [REST] },
      ],
      passes: [{ ...kick, release: 0 }, { id: 'p2', from: 'a2', to: 'a1', at: 1 }],
    }));
    expect(warnings(script)).toEqual([
      { step: 0, pass: 'p2', kind: 'early', message: 'a1 reaches the catch point before a2 has the ball' },
    ]);
  });

  it('lists each loose ball, where it lies and who collects it', () => {
    const step = stepOf(field({
      placements: [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 4, y: 15 } },
        { marker: 'd1', cell: { x: 10, y: 2 } },
        { marker: 'ball', holder: 'a1' },
        { marker: 'ball2', cell: { x: 2, y: 2 } },
      ],
      moves: [{ marker: 'd1', waypoints: [REST] }],
      passes: [kick, { id: 'p2', from: 'd1', to: 'a1' }],
    }));
    expect(looseBalls(step)).toEqual([
      { ball: 'ball2', cell: { x: 2, y: 2 } },
      { ball: 'ball', cell: REST, kick: 'k1', collect: 'p2' },
    ]);
  });
});

describe('validating a Collect', () => {
  it('needs the collector’s Run to end where the ball comes to rest', () => {
    expect(errorsOf(field({
      moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 4 }] }],
      passes: [kick, { id: 'p2', from: 'a2', to: 'a1' }],
    }))).toEqual([
      'base.passes[1].from: the ball comes to rest on cell (10, 3) after the Kick to space "k1", but the move of "a2" ends on cell (10, 4); end it on cell (10, 3) for "a2" to Collect it',
    ]);
    expect(errorsOf(field({
      placements: [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 4, y: 15 } },
        { marker: 'ball', cell: { x: 4, y: 10 } },
      ],
      moves: [{ marker: 'a2', waypoints: [{ x: 4, y: 11 }] }],
      passes: [{ id: 'p1', from: 'a2', to: 'a1' }],
    }))).toEqual([
      'base.passes[0].from: the ball lies loose on cell (4, 10), but the move of "a2" ends on cell (4, 11); end it on cell (4, 10) for "a2" to Collect it',
    ]);
  });

  it('has no Release: the collector’s Run ends at the ball', () => {
    expect(errorsOf(field({
      moves: [{ marker: 'a2', waypoints: [REST] }],
      passes: [kick, { id: 'p2', from: 'a2', to: 'a1', release: 0 }],
    }))).toEqual([
      'base.passes[1].release: "a2" Collects the ball at the end of their Run, so there is no Run left to release it on; leave out "release"',
    ]);
  });

  it('refuses a collector whose Run waits for the very pass that collects', () => {
    expect(errorsOf(field({
      moves: [{ marker: 'a2', waypoints: [REST], after: { pass: 'p2' } }],
      passes: [kick, { id: 'p2', from: 'a2', to: 'a1' }],
    }))).toEqual([
      'base.moves[0].after: "a2" Collects the loose ball for pass "p2" at the end of this move, so the move cannot wait for that pass',
    ]);
  });

  it('refuses a collector who already holds another ball', () => {
    expect(errorsOf(field({
      placements: [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 4, y: 15 } },
        { marker: 'ball', holder: 'a1' },
        { marker: 'ball2', holder: 'a2' },
      ],
      moves: [{ marker: 'a2', waypoints: [REST], pace: 'sprint' }],
      passes: [kick, { id: 'p2', from: 'a2', to: 'a1' }],
    }))).toEqual([
      'base.passes[1].from: marker "a2" Collects ball "ball" while still holding ball "ball2"; a player cannot hold two balls at once',
    ]);
  });

  it('is set in a Progression like any pass, and checked there', () => {
    const script = valid(field({ passes: [kick] }, [
      {
        lever: 'time',
        changes: [
          { type: 'setMove', marker: 'd1', waypoints: [REST] },
          { type: 'setPass', id: 'p2', from: 'd1', to: 'd2' },
        ],
      },
    ]));
    expect(positionsAt(resolveStep(script, 0), 0).passes.map((f) => f.pickup)).toEqual([undefined]);
    expect(positionsAt(resolveStep(script, 1), 0).passes[1].pickup).toBeDefined();
    expect(errorsOf(field({ passes: [kick] }, [{ lever: 'time', changes: [{ type: 'setPass', id: 'p2', from: 'd1', to: 'd2' }] }]))).toEqual([
      'progressions[0].changes[0].from: the ball comes to rest on cell (10, 3) after the Kick to space "k1", so "d1" Collects it with this pass: give "d1" a move that ends on cell (10, 3)',
    ]);
  });
});
