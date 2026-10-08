import { describe, it, expect } from 'vitest';
import {
  validate,
  resolveStep,
  positionsAt,
  formatError,
  PACE_SPEEDS_MPS,
  RUN_ACCELERATION_MPS2,
  RUN_TAPER_MPS2,
  type ResolvedStep,
} from './engine';

function stepOf(input: unknown): ResolvedStep {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, 0);
}

/** a1 holds the ball at (0, 0); a2 starts at (10, 0) and a3 at (20, 0). */
function drill(moves: unknown[], passes: unknown[] = []) {
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

const { jog, sprint, walk } = PACE_SPEEDS_MPS;
const a = RUN_ACCELERATION_MPS2;
const d = RUN_TAPER_MPS2;

/** a2 jogs 8 m to (10, 8), then sprints 20 m on to (10, 28). */
const JOG_THEN_SPRINT = { marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 28, pace: 'sprint' }] };

// Written out: accelerate to jog, jog to the waypoint, speed up to sprint, sprint, taper.
const toJog = jog / a;
const atWaypoint = toJog + (8 - (jog * jog) / (2 * a)) / jog;
const speedUp = (sprint - jog) / a;
const speedUpMetres = (sprint * sprint - jog * jog) / (2 * a);
const taperMetres = (sprint * sprint) / (2 * d);
const JOG_THEN_SPRINT_SECONDS = atWaypoint + speedUp + (20 - speedUpMetres - taperMetres) / sprint + sprint / d;

/** Speeds (m/s) every `dt` seconds along a2's Run. */
function speeds(step: ResolvedStep, dt = 0.01) {
  const { duration } = positionsAt(step, 0);
  const out: Array<{ t: number; y: number; v: number }> = [];
  for (let t = 0; t + dt <= duration + 1e-9; t += dt) {
    const y0 = positionsAt(step, t).positions.a2.y;
    const y1 = positionsAt(step, t + dt).positions.a2.y;
    out.push({ t, y: y0, v: Math.abs(y1 - y0) / dt });
  }
  return out;
}

describe('Pace per waypoint segment', () => {
  it('accepts a Pace on a waypoint and rejects an unknown one', () => {
    expect(validate(drill([JOG_THEN_SPRINT])).ok).toBe(true);
    const bad = validate(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 8, pace: 'run' }] }]));
    expect(bad.ok).toBe(false);
  });

  it('jogs to the waypoint, then sprints on: times and positions', () => {
    const step = stepOf(drill([JOG_THEN_SPRINT]));
    expect(positionsAt(step, 0).duration).toBeCloseTo(JOG_THEN_SPRINT_SECONDS);
    // At jog Pace through the first segment: reaches the waypoint as a jog would.
    expect(positionsAt(step, atWaypoint).positions.a2.y).toBeCloseTo(8);
    expect(positionsAt(step, toJog + 1).positions.a2.y).toBeCloseTo((jog * jog) / (2 * a) + jog);
    // Quicker than a Run jogged throughout.
    const jogged = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 28 }] }]));
    expect(positionsAt(step, 0).duration).toBeLessThan(positionsAt(jogged, 0).duration);
  });

  it('blends between Paces with no jump in speed, and never runs a segment faster than its Pace', () => {
    const dt = 0.01;
    const samples = speeds(stepOf(drill([JOG_THEN_SPRINT])), dt);
    for (let i = 1; i < samples.length; i++) {
      expect(Math.abs(samples[i].v - samples[i - 1].v)).toBeLessThan(Math.max(a, d) * dt * 1.5 + 1e-6);
    }
    for (const { y, v } of samples) expect(v).toBeLessThanOrEqual((y < 8 - 1e-6 ? jog : sprint) + 1e-6);
    // It does reach sprint.
    expect(Math.max(...samples.map((s) => s.v))).toBeCloseTo(sprint, 1);
  });

  it('eases down onto a slower segment before reaching it', () => {
    const step = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 20, pace: 'sprint' }, { x: 10, y: 28, pace: 'walk' }] }]));
    const samples = speeds(step);
    const crossing = samples.find((s) => s.y >= 20)!;
    expect(crossing.v).toBeLessThanOrEqual(walk + 0.05);
    expect(Math.max(...samples.map((s) => s.v))).toBeCloseTo(sprint, 1);
  });

  it('starts from rest and tapers to a stop exactly on the last waypoint', () => {
    const step = stepOf(drill([JOG_THEN_SPRINT]));
    const { duration } = positionsAt(step, 0);
    const samples = speeds(step);
    expect(samples[0].v).toBeLessThan(0.05);
    expect(samples[samples.length - 1].v).toBeLessThan(0.1);
    expect(positionsAt(step, duration).positions.a2).toEqual({ x: 10, y: 28 });
    expect(positionsAt(step, duration + 5).positions.a2).toEqual({ x: 10, y: 28 });
  });

  it('a Pace on a waypoint equal to the Run Pace changes nothing', () => {
    const plain = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 8 }, { x: 10, y: 28 }], pace: 'sprint' }]));
    const same = stepOf(drill([{ marker: 'a2', waypoints: [{ x: 10, y: 8, pace: 'sprint' }, { x: 10, y: 28 }], pace: 'sprint' }]));
    for (const t of [0.5, 2, 4, 6]) expect(positionsAt(same, t).positions.a2.y).toBeCloseTo(positionsAt(plain, t).positions.a2.y);
  });

  describe('timed to the ball', () => {
    /** a2 jogs then sprints to receive; the pass waits for a3 to run `draw` metres. */
    const held = (draw: number) =>
      stepOf(
        drill(
          [JOG_THEN_SPRINT, { marker: 'a3', waypoints: [{ x: 20, y: draw }] }],
          [{ id: 'p1', from: 'a1', to: 'a2', after: { move: 'a3' } }],
        ),
      );

    it('still meets the ball, keeping the jog-then-sprint shape', () => {
      const step = held(25);
      const [p1] = positionsAt(step, 0).passes;
      const scale = p1.land / JOG_THEN_SPRINT_SECONDS;
      expect(scale).toBeGreaterThan(1);
      expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 10, y: 28 });
      expect(positionsAt(step, p1.land).positions.ball).toEqual({ x: 10, y: 28 });
      // Slowed uniformly: it reaches the jog waypoint at the same share of its Run.
      expect(positionsAt(step, atWaypoint * scale).positions.a2.y).toBeCloseTo(8);
    });

    it('slows until its slowest segment is a walk, then starts late', () => {
      // A long draw: slowing alone cannot absorb it.
      const step = stepOf(
        drill(
          [JOG_THEN_SPRINT, { marker: 'a3', waypoints: [{ x: 20, y: 28 }, { x: 0, y: 28 }, { x: 0, y: 2 }, { x: 30, y: 2 }] }],
          [{ id: 'p1', from: 'a1', to: 'a2', after: { move: 'a3' } }],
        ),
      );
      const [p1] = positionsAt(step, 0).passes;
      // The jog segment slows at most to walk: twice as long. The rest is a later start.
      const delay = p1.land - JOG_THEN_SPRINT_SECONDS * (jog / walk);
      expect(delay).toBeGreaterThan(0);
      expect(positionsAt(step, delay - 0.01).positions.a2).toEqual({ x: 10, y: 0 });
      expect(positionsAt(step, delay + 0.5).positions.a2.y).toBeGreaterThan(0);
      expect(positionsAt(step, p1.land).positions.a2).toEqual({ x: 10, y: 28 });
    });

    it('never runs a segment below walk when the receiver is far too early', () => {
      const step = stepOf(
        drill(
          [JOG_THEN_SPRINT, { marker: 'a3', waypoints: [{ x: 20, y: 28 }, { x: 0, y: 28 }, { x: 0, y: 2 }, { x: 30, y: 2 }] }],
          [{ id: 'p1', from: 'a1', to: 'a2', after: { move: 'a3' } }],
        ),
      );
      const [p1] = positionsAt(step, 0).passes;
      // Far too early: the start is delayed rather than crawling.
      expect(p1.land - JOG_THEN_SPRINT_SECONDS * (jog / walk)).toBeGreaterThan(1);
      const samples = speeds(step, 0.05);
      // Cruising through the jog segment: at walk, not below.
      const jogging = samples.filter((s) => s.y > 2 && s.y < 7.5);
      expect(jogging.length).toBeGreaterThan(0);
      for (const { v } of jogging) expect(v).toBeGreaterThanOrEqual(walk - 1e-3);
      // The sprint segment keeps its shape: twice the jog, halved with it.
      const sprinting = samples.filter((s) => s.y > 12 && s.y < 22);
      for (const { v } of sprinting) expect(v).toBeCloseTo(sprint * (walk / jog), 2);
    });
  });
});
