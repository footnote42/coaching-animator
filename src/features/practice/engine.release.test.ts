import { describe, it, expect } from 'vitest';
import { validate, resolveStep, positionsAt, warnings, formatError, type Point, type ResolvedStep } from './engine';

const near = (a: Point, b: Point, tol = 1e-6) => Math.hypot(a.x - b.x, a.y - b.y) < tol;

/**
 * a1 holds the ball at (0, 20) and runs up through (0, 15) to (0, 5); a2
 * starts at (5, 20) and a3 at (10, 20). No Direction unless given.
 */
function drill(moves: unknown[], passes: unknown[], extra: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    area: { width: 30, length: 30 },
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'a3', kind: 'attacker' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 0, y: 20 } },
        { marker: 'a2', cell: { x: 5, y: 20 } },
        { marker: 'a3', cell: { x: 10, y: 20 } },
        { marker: 'ball', holder: 'a1' },
      ],
      moves,
      passes,
    },
    ...extra,
  };
}

const CARRIER = { marker: 'a1', waypoints: [{ x: 0, y: 15 }, { x: 0, y: 5 }] };

function stepOf(input: unknown, n = 0): ResolvedStep {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, n);
}

function errorsOf(input: unknown): string[] {
  const result = validate(input);
  return result.ok ? [] : result.errors.map(formatError);
}

describe('Release: the carrier passes mid-Run', () => {
  // a2 runs 4 m up to (5, 16) and is passed to as a1 reaches (0, 15).
  const released = (release: number | undefined = 0) =>
    stepOf(
      drill(
        [CARRIER, { marker: 'a2', waypoints: [{ x: 5, y: 16 }] }],
        [{ id: 'p1', from: 'a1', to: 'a2', ...(release !== undefined && { release }) }],
      ),
    );

  it('lets the ball go when the carrier reaches the release waypoint', () => {
    const step = released();
    const [p1] = positionsAt(step, 0).passes;
    expect(p1.fire).toBeGreaterThan(0);
    expect(p1.start).toEqual({ x: 0, y: 15 });
    expect(near(positionsAt(step, p1.fire).positions.a1, { x: 0, y: 15 })).toBe(true);
    // Until then the ball rides with the carrier.
    const before = positionsAt(step, p1.fire / 2).positions;
    expect(before.ball).toEqual(before.a1);
  });

  it('keeps the carrier running the rest of their Run without the ball', () => {
    const step = released();
    const { passes, duration } = positionsAt(step, 0);
    const [p1] = passes;
    const later = positionsAt(step, p1.land + 0.5).positions;
    // Still running on, past the release point...
    expect(later.a1.y).toBeLessThan(15);
    expect(later.a1.y).toBeGreaterThan(5);
    // ...while the ball is with the receiver.
    expect(later.ball).toEqual(later.a2);
    const end = positionsAt(step, duration).positions;
    expect(end.a1).toEqual({ x: 0, y: 5 });
    expect(end.ball).toEqual({ x: 5, y: 16 });
  });

  it('times the receiver to meet a ball released there', () => {
    const step = released();
    const [p1] = positionsAt(step, 0).passes;
    expect(p1.end).toEqual({ x: 5, y: 16 });
    expect(p1.land).toBeCloseTo(p1.fire + Math.hypot(5, 1) / 8);
    // Slowed, not held: a2 is moving early, still on its way just before the ball lands, there as it does.
    expect(positionsAt(step, 0.5).positions.a2.y).toBeLessThan(20);
    expect(near(positionsAt(step, p1.land - 0.05).positions.a2, { x: 5, y: 16 })).toBe(false);
    expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 5, y: 16 });
  });

  it('tracks who holds the ball over time: carrier, flight, receiver', () => {
    const step = released();
    const [p1] = positionsAt(step, 0).passes;
    const at = (t: number) => positionsAt(step, t).positions;
    expect(at(p1.fire - 0.1).ball).toEqual(at(p1.fire - 0.1).a1);
    const mid = at((p1.fire + p1.land) / 2);
    expect(near(mid.ball, mid.a1, 0.1)).toBe(false);
    expect(near(mid.ball, mid.a2, 0.1)).toBe(false);
    expect(near(mid.ball, { x: 2.5, y: 15.5 }, 1e-6)).toBe(true);
    expect(at(p1.land + 0.2).ball).toEqual(at(p1.land + 0.2).a2);
  });

  it('releases at the last waypoint when that is the one named', () => {
    const step = released(1);
    const [p1] = positionsAt(step, 0).passes;
    expect(p1.start).toEqual({ x: 0, y: 5 });
  });

  it('slides later along the Run, as any pass does, when the receiver would be late', () => {
    // a2 runs 12 m to (5, 8): it cannot reach the catch point by the time a1 reaches (0, 15).
    const step = stepOf(
      drill([CARRIER, { marker: 'a2', waypoints: [{ x: 5, y: 8 }] }], [{ id: 'p1', from: 'a1', to: 'a2', release: 0 }]),
    );
    const [p1] = positionsAt(step, 0).passes;
    expect(p1.start.y).toBeLessThan(15);
    expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 5, y: 8 });
  });

  it('works for a Kick to space: the ball leaves from the release waypoint', () => {
    const step = stepOf(drill([CARRIER], [{ id: 'k1', from: 'a1', cell: { x: 0, y: 2 }, kick: true, release: 0 }]));
    const [k1] = positionsAt(step, 0).passes;
    expect(k1.start).toEqual({ x: 0, y: 15 });
    expect(near(positionsAt(step, k1.fire).positions.a1, { x: 0, y: 15 })).toBe(true);
    expect(positionsAt(step, k1.land + 0.1).positions.a1.y).toBeLessThan(15);
  });

  it('runs on in support and receives the ball back, deterministically', () => {
    // a1 releases to a2, runs on and is passed back on the run's end.
    const script = drill(
      [CARRIER, { marker: 'a2', waypoints: [{ x: 5, y: 17 }] }],
      [
        { id: 'p1', from: 'a1', to: 'a2', release: 0 },
        { id: 'p2', from: 'a2', to: 'a1' },
      ],
    );
    const first = positionsAt(stepOf(script), 0);
    expect(positionsAt(stepOf(script), 0)).toEqual(first);
    const [p1, p2] = first.passes;
    expect(p1.start).toEqual({ x: 0, y: 15 });
    expect(p2.fire).toBeGreaterThanOrEqual(p1.land);
    expect(p2.end).toEqual({ x: 0, y: 5 });
    expect(positionsAt(stepOf(script), first.duration).positions.ball).toEqual({ x: 0, y: 5 });
  });

  it('uses the release point for the forward-pass warning', () => {
    // a2 catches on (5, 13): ahead of a release on (0, 15), behind one on (0, 5).
    // a1 walks, so a2 is on time for either.
    const at = (release: number) => {
      const result = validate(
        drill(
          [{ ...CARRIER, pace: 'walk' }, { marker: 'a2', waypoints: [{ x: 5, y: 13 }] }],
          [{ id: 'p1', from: 'a1', to: 'a2', release }],
          { direction: 'up' },
        ),
      );
      if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
      return warnings(result.script).map((w) => w.message);
    };
    expect(at(0)).toEqual(['Pass 1 goes forward']);
    expect(at(1)).toEqual([]);
  });

  it('warns when an untimed receiver reaches the catch point before the ball is released', () => {
    // a2 is timed to p1 and runs on to (5, 10); a3 is timed to p2 on (10, 19) and runs
    // on 17 m to release p3 back to a2, who has long passed waypoint 1 by then.
    const result = validate(
      drill(
        [
          { marker: 'a2', waypoints: [{ x: 5, y: 18 }, { x: 5, y: 10 }] },
          { marker: 'a3', waypoints: [{ x: 10, y: 19 }, { x: 10, y: 2 }] },
        ],
        [
          { id: 'p1', from: 'a1', to: 'a2', at: 0 },
          { id: 'p2', from: 'a2', to: 'a3', at: 0 },
          { id: 'p3', from: 'a3', to: 'a2', at: 1, release: 1 },
        ],
      ),
    );
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(warnings(result.script)).toEqual([
      { step: 0, pass: 'p3', kind: 'early', message: 'a2 reaches the catch point before a3 releases the ball' },
    ]);
  });
});

describe('Release validation', () => {
  it('refuses a release from a carrier with no Run', () => {
    expect(errorsOf(drill([], [{ id: 'p1', from: 'a1', to: 'a2', release: 0 }]))).toEqual([
      'base.passes[0].release: marker "a1" has no move in this Step, so there is nothing to release on the run; leave out "release" or give "a1" a move',
    ]);
  });

  it('refuses a release beyond the carrier\'s Run', () => {
    expect(errorsOf(drill([CARRIER], [{ id: 'p1', from: 'a1', to: 'a2', release: 2 }]))).toEqual([
      'base.passes[0].release: waypoint 2 is outside the move of "a1", which has 2 waypoints (0-1)',
    ]);
  });

  it('refuses a negative release', () => {
    expect(errorsOf(drill([CARRIER], [{ id: 'p1', from: 'a1', to: 'a2', release: -1 }]))[0]).toMatch(/^base\.passes\[0\]\.release: /);
  });

  it('refuses a release when the carrier\'s Run waits on the pass itself', () => {
    expect(errorsOf(drill([{ ...CARRIER, after: { pass: 'p1' } }], [{ id: 'p1', from: 'a1', to: 'a2', release: 0 }]))).toEqual([
      'base.passes[0].release: the move of "a1" waits for this pass, so "a1" has not set off when it is thrown; leave out "release"',
    ]);
  });

  it('is set by a Progression and checked against the Runs of that Step', () => {
    const base = drill([CARRIER], [{ id: 'p1', from: 'a1', to: 'a2' }]);
    const withRelease = {
      ...base,
      progressions: [
        { lever: 'time', commentary: { points: [] }, changes: [{ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', release: 1 }] },
      ],
    };
    expect(positionsAt(stepOf(withRelease, 0), 0).passes[0].start).toEqual({ x: 0, y: 20 });
    expect(positionsAt(stepOf(withRelease, 1), 0).passes[0].start).toEqual({ x: 0, y: 5 });

    // A later Step that shortens the carrier's Run leaves the release beyond it.
    const shortened = {
      ...withRelease,
      progressions: [
        ...withRelease.progressions,
        { lever: 'time', commentary: { points: [] }, changes: [{ type: 'setMove', marker: 'a1', waypoints: [{ x: 0, y: 10 }] }] },
      ],
    };
    expect(errorsOf(shortened)).toEqual([
      'progressions[1]: pass "p1": waypoint 1 is outside the move of "a1", which has 1 waypoint (0)',
    ]);
  });
});
