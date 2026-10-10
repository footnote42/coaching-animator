import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  validate,
  resolveStep,
  positionsAt,
  stepCount,
  formatError,
  PACE_SPEEDS_MPS,
  PASS_SPEED_MPS,
  RUN_ACCELERATION_MPS2,
  RUN_TAPER_MPS2,
  type Point,
  type ResolvedStep,
} from './engine';
import { HERO_SCRIPT } from '@/app/_components/heroScript';
import halfPitchPlay from './examples/half-pitch-play.json';

/** Seconds an eased Run takes over `metres` at `speed` (as the engine computes it, written out here). */
function runSeconds(metres: number, speed: number = PACE_SPEEDS_MPS.jog): number {
  const a = RUN_ACCELERATION_MPS2;
  const d = RUN_TAPER_MPS2;
  const peak = Math.min(speed, Math.sqrt((2 * metres * a * d) / (a + d)));
  const cruise = metres - (peak * peak) / (2 * a) - (peak * peak) / (2 * d);
  return peak / a + cruise / peak + peak / d;
}

function stepOf(input: unknown, n = 0): ResolvedStep {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, n);
}

const near = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) < 1e-6;

/** a1 holds the ball at (0, 0); a2 starts at (10, 0) and a3 at (20, 0). */
function drill(moves: unknown[], passes: unknown[]) {
  return {
    schemaVersion: 1,
    area: { width: 40, length: 30 },
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'a3', kind: 'attacker' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 0, y: 0 } },
        { marker: 'a2', cell: { x: 10, y: 0 } },
        { marker: 'a3', cell: { x: 20, y: 0 } },
        { marker: 'ball', holder: 'a1' },
      ],
      moves,
      passes,
    },
  };
}

describe('receivers are timed to the ball (ADR 0005)', () => {
  /** a2 runs `run` metres (8 by default) to (10, run) to receive; the pass waits for a3 to run `draw` metres (draw and pass). */
  const held = (draw: number, pace?: string, run = 8) =>
    stepOf(
      drill(
        [
          { marker: 'a2', waypoints: [{ x: 10, y: run }], ...(pace && { pace }) },
          { marker: 'a3', waypoints: [{ x: 20, y: draw }] },
        ],
        [{ id: 'p1', from: 'a1', to: 'a2', after: { move: 'a3' } }],
      ),
    );
  const flightTo = (end: Point) => Math.hypot(end.x, end.y) / PASS_SPEED_MPS;

  it('slows an early receiver so it reaches the catch point as the ball does', () => {
    const step = held(10);
    const [p1] = positionsAt(step, 0).passes;
    // Draw and pass still holds the ball until the drawing Run has finished.
    expect(p1.fire).toBeCloseTo(runSeconds(10));
    expect(p1.land).toBeCloseTo(runSeconds(10) + flightTo({ x: 10, y: 8 }));
    // Slowed, not held back: a2 sets off at once...
    expect(positionsAt(step, 0.5).positions.a2.y).toBeGreaterThan(0);
    // ...and is still on its way until the ball arrives, then catches it on the cell.
    expect(near(positionsAt(step, p1.land - 0.05).positions.a2, { x: 10, y: 8 })).toBe(false);
    expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 10, y: 8 });
    expect(positionsAt(step, p1.land).positions.ball).toEqual({ x: 10, y: 8 });
  });

  it('keeps the shape of the slowed Run: easing and taper stretch with it', () => {
    const step = held(10);
    const [p1] = positionsAt(step, 0).passes;
    const scale = p1.land / runSeconds(8);
    expect(scale).toBeGreaterThan(1);
    expect(scale).toBeLessThanOrEqual(PACE_SPEEDS_MPS.jog / PACE_SPEEDS_MPS.walk);
    // Halfway through the slowed Run it is where the unslowed Run is halfway through.
    const unslowed = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 8 }] }], []));
    const half = runSeconds(8) / 2;
    expect(positionsAt(step, half * scale).positions.a2.y).toBeCloseTo(positionsAt(unslowed, half).positions.a2.y);
  });

  it('delays the start only for what slowing to walk cannot absorb', () => {
    const step = held(20);
    const [p1] = positionsAt(step, 0).passes;
    // A jog slows at most to walk: twice as long. The rest is a later start.
    const slowest = runSeconds(8) * (PACE_SPEEDS_MPS.jog / PACE_SPEEDS_MPS.walk);
    const delay = p1.land - slowest;
    expect(delay).toBeGreaterThan(0);
    expect(positionsAt(step, delay - 0.01).positions.a2).toEqual({ x: 10, y: 0 });
    expect(positionsAt(step, delay + 0.5).positions.a2.y).toBeGreaterThan(0);
    expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 10, y: 8 });
  });

  it('never slows a walking receiver: it starts later instead', () => {
    const step = held(10, 'walk', 3);
    const [p1] = positionsAt(step, 0).passes;
    const delay = p1.land - runSeconds(3, PACE_SPEEDS_MPS.walk);
    expect(delay).toBeGreaterThan(0);
    expect(positionsAt(step, delay - 0.01).positions.a2).toEqual({ x: 10, y: 0 });
    // Once going, it walks as drawn: where an unheld walk is after the same time.
    const unheld = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 3 }], pace: 'walk' }], []));
    expect(positionsAt(step, delay + 1).positions.a2.y).toBeCloseTo(positionsAt(unheld, 1).positions.a2.y);
    expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 10, y: 3 });
  });

  it('does not slow or delay a receiver that is just on time', () => {
    // No draw: a2 is late at its own Pace, so its Run is played as drawn.
    const step = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 8 }] }], [{ id: 'p1', from: 'a1', to: 'a2' }]));
    const { passes, duration } = positionsAt(step, 0);
    expect(duration).toBeCloseTo(runSeconds(8));
    expect(passes[0].land).toBeCloseTo(runSeconds(8));
  });

  it('lets a late receiver set the pace: the carrier runs on and passes as it can be taken', () => {
    // a1 jogs up with the ball; a2 sprints 20 m and cannot get there sooner.
    const step = stepOf(
      drill(
        [
          { marker: 'a1', waypoints: [{ x: 0, y: 20 }] },
          { marker: 'a2', waypoints: [{ x: 10, y: 20 }], pace: 'sprint' },
        ],
        [{ id: 'p1', from: 'a1', to: 'a2' }],
      ),
    );
    const [p1] = positionsAt(step, 0).passes;
    const arrives = runSeconds(20, PACE_SPEEDS_MPS.sprint);
    expect(p1.land).toBeCloseTo(arrives);
    expect(p1.end).toEqual({ x: 10, y: 20 });
    // No stationary wait: the carrier is still running when it passes, from where it has got to.
    expect(p1.fire).toBeLessThan(runSeconds(20));
    const before = positionsAt(step, p1.fire - 0.1).positions.a1;
    const at = positionsAt(step, p1.fire).positions.a1;
    expect(at.y).toBeGreaterThan(before.y);
    expect(p1.start.y).toBeCloseTo(at.y);
    // The receiver is not slowed: it runs as drawn.
    expect(positionsAt(step, 1).positions.a2.y).toBeCloseTo(0.5 * RUN_ACCELERATION_MPS2);
  });

  it('catches on the run on the catch waypoint, the receiver timed to it', () => {
    // a2 runs through (10, 4) to (10, 12); the pass waits for a3's 10 m draw.
    const step = stepOf(
      drill(
        [
          { marker: 'a2', waypoints: [{ x: 10, y: 4 }, { x: 10, y: 12 }] },
          { marker: 'a3', waypoints: [{ x: 20, y: 10 }] },
        ],
        [{ id: 'p1', from: 'a1', to: 'a2', at: 0, after: { move: 'a3' } }],
      ),
    );
    const { passes, duration } = positionsAt(step, 0);
    expect(passes[0].end).toEqual({ x: 10, y: 4 });
    expect(positionsAt(step, passes[0].land).positions.a2.y).toBeCloseTo(4);
    // Still running through it, and on to the end of its Run with the ball.
    expect(positionsAt(step, passes[0].land + 0.5).positions.a2.y).toBeGreaterThan(4);
    expect(positionsAt(step, duration).positions.ball).toEqual({ x: 10, y: 12 });
  });

  it('is deterministic when a receiver also throws the pass before: the loop is left untimed', () => {
    // a1 runs, passes to a2 as it sets off, and is passed back: timing a1 to p2
    // would move where it throws p1 from, which p2 waits on.
    const script = drill(
      [{ marker: 'a1', waypoints: [{ x: 0, y: 6 }, { x: 0, y: 15 }] }],
      [
        { id: 'p1', from: 'a1', to: 'a2' },
        { id: 'p2', from: 'a2', to: 'a1', at: 1 },
      ],
    );
    const first = positionsAt(stepOf(script), 0);
    const again = positionsAt(stepOf(script), 0);
    expect(again).toEqual(first);
    expect(first.passes[0].start).toEqual({ x: 0, y: 0 });
    expect(first.passes[1].land).toBeGreaterThan(first.passes[0].land);
  });
});

/**
 * Who stands still waiting for a pass: a receiver that reaches its catch point
 * before the ball, or a carrier with a Run that stands holding a ball it could
 * already pass (after the previous catch and any draw-and-pass Run).
 */
function waiting(step: ResolvedStep): string[] {
  const { passes, duration } = positionsAt(step, 0);
  const pos = (id: string, t: number) => positionsAt(step, t).positions[id];
  const runners = new Set(step.moves.map((m) => m.marker));
  /** When a Run finishes: the first time the marker is where it ends up. */
  const finish = (id: string) => {
    const end = pos(id, duration);
    let [lo, hi] = [0, duration];
    for (let k = 0; k < 50; k++) {
      const mid = (lo + hi) / 2;
      if (near(pos(id, mid), end)) hi = mid;
      else lo = mid;
    }
    return hi;
  };
  const found: string[] = [];
  passes.forEach((flight, i) => {
    const pass = step.passes.find((p) => p.id === flight.id)!;
    // A Kick to space (#147) has no receiver to wait.
    const to = flight.to;
    if (to !== undefined && runners.has(to) && !near(flight.end, pos(to, 0)) && near(pos(to, flight.land - 0.05), flight.end)) {
      found.push(`${to} stands at the catch point of ${flight.id}`);
    }
    const previous = passes.slice(0, i).filter((f) => f.ball === flight.ball).pop();
    const ready = Math.max(previous?.land ?? 0, pass.after?.move ? finish(pass.after.move) : 0);
    if (!runners.has(flight.from)) return;
    for (let t = ready; t < flight.fire - 0.05; t += 0.1) {
      if (near(pos(flight.from, t), pos(flight.from, t + 0.05))) {
        found.push(`${flight.from} stands holding the ball for ${flight.id} at ${t.toFixed(2)} s`);
        break;
      }
    }
  });
  return found;
}

describe('no marker stands waiting for a pass', () => {
  const examplesDir = path.join(process.cwd(), 'skill', 'coaching-animator', 'examples');
  const scripts: Array<[string, unknown]> = [
    ['the landing 3 v 2', HERO_SCRIPT],
    ['the guide half-pitch play', halfPitchPlay],
    ...readdirSync(examplesDir)
      .filter((f) => f.endsWith('.json'))
      .map((f): [string, unknown] => [f, JSON.parse(readFileSync(path.join(examplesDir, f), 'utf8'))]),
  ];

  it.each(scripts)('%s', (_, input) => {
    const result = validate(input);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    for (let n = 0; n < stepCount(result.script); n++) {
      expect(waiting(resolveStep(result.script, n)), `Step ${n + 1}`).toEqual([]);
    }
  });
});
