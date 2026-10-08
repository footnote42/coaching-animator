import { describe, it, expect } from 'vitest';
import {
  validate,
  resolveStep,
  positionsAt,
  formatError,
  PACE_SPEEDS_MPS,
  DEFAULT_PACE,
  RUN_ACCELERATION_MPS2,
  RUN_TAPER_MPS2,
  PASS_SPEED_MPS,
} from './engine';

const jog = PACE_SPEEDS_MPS[DEFAULT_PACE];

function errorsOf(input: unknown): string[] {
  const result = validate(input);
  if (result.ok) throw new Error('expected validation to fail');
  return result.errors.map(formatError);
}

function stepOf(input: unknown, n = 0) {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, n);
}

describe('receive, pass, run, receive again', () => {
  /** a1, a2, a3 ten metres apart on row 0, a1 holding the ball. a2 receives, passes, runs 6 m out and back, then receives again. */
  const runAndReturn = (extra: Record<string, unknown> = {}) => ({
    schemaVersion: 1,
    area: { width: 40, length: 20 },
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
      moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 6 }, { x: 10, y: 0 }], after: { pass: 'p2' } }],
      passes: [
        { id: 'p1', from: 'a1', to: 'a2', ...extra },
        { id: 'p2', from: 'a2', to: 'a3' },
        { id: 'p3', from: 'a3', to: 'a2' },
      ],
    },
  });

  it('catches a pass in place when the receiver waits on that very pass, and waits for the run before the next catch', () => {
    const { passes } = positionsAt(stepOf(runAndReturn()), 0);
    const [p1, p2, p3] = passes;
    expect(p1.fire).toBe(0);
    expect(p1.end).toEqual({ x: 10, y: 0 });
    expect(p2.fire).toBeCloseTo(p1.land);
    // a2 sets off when p2 is caught, and p3 lands as it is back: 12 m at jog,
    // plus the time lost speeding up from rest and tapering onto its last waypoint.
    // Receivers are timed to the ball (#144), so p3 is thrown before a2 arrives.
    const runBack = 12 / jog + jog / (2 * RUN_ACCELERATION_MPS2) + jog / (2 * RUN_TAPER_MPS2);
    expect(p3.land).toBeCloseTo(p2.land + runBack);
    expect(p3.fire).toBeCloseTo(p2.land + runBack - 10 / PASS_SPEED_MPS);
    expect(p3.end).toEqual({ x: 10, y: 0 });
  });

  it('cannot catch on the run a pass that is caught in place', () => {
    expect(errorsOf(runAndReturn({ at: 0 }))).toEqual([
      'base.passes[0].at: the move of "a2" waits for this pass, so it is caught on the cell "a2" starts on; leave out "at"',
    ]);
  });
});

describe('circle passing', () => {
  const ring = [
    { id: 'a1', cell: { x: 10, y: 4 }, cone: { x: 10, y: 2 } },
    { id: 'a2', cell: { x: 15, y: 7 }, cone: { x: 17, y: 6 } },
    { id: 'a3', cell: { x: 15, y: 13 }, cone: { x: 17, y: 14 } },
    { id: 'a4', cell: { x: 10, y: 16 }, cone: { x: 10, y: 18 } },
    { id: 'a5', cell: { x: 5, y: 13 }, cone: { x: 3, y: 14 } },
    { id: 'a6', cell: { x: 5, y: 7 }, cone: { x: 3, y: 6 } },
  ];
  /** Across the circle, never next door. */
  const order = ['a1', 'a3', 'a6', 'a4', 'a2', 'a5'];
  /** Twice round from `start`, as pass ids p<first>... */
  const around = (start: string, ball?: string, first = 1) =>
    Array.from({ length: 12 }, (_, i) => ({
      id: `p${first + i}`,
      ...(ball ? { ball } : {}),
      from: order[(order.indexOf(start) + i) % 6],
      to: order[(order.indexOf(start) + i + 1) % 6],
    }));
  const circle = (progressions: unknown[] = [], balls = ['ball']) => ({
    schemaVersion: 1,
    area: { template: 'square', width: 20, length: 20 },
    markers: [
      ...ring.map((p) => ({ id: p.id, kind: 'attacker' })),
      ...ring.map((_, i) => ({ id: `c${i + 1}`, kind: 'cone' })),
      ...balls.map((id) => ({ id, kind: 'ball' })),
    ],
    base: {
      placements: [
        ...ring.map((p) => ({ marker: p.id, cell: p.cell })),
        ...ring.map((p, i) => ({ marker: `c${i + 1}`, cell: p.cone })),
        { marker: 'ball', holder: 'a1' },
      ],
      moves: [],
      passes: around('a1'),
    },
    progressions,
  });
  // Each player sets off round their cone and back after the first pass they make.
  const runPlay = {
    lever: 'time',
    changes: ring.map((p) => ({
      type: 'setMove',
      marker: p.id,
      waypoints: [p.cone, p.cell],
      after: { pass: `p${order.indexOf(p.id) + 1}` },
    })),
  };
  const secondBall = {
    lever: 'equipment',
    changes: [
      { type: 'addMarker', marker: 'ball2', holder: 'a4' },
      ...around('a4', 'ball2', 13).map((p) => ({ type: 'setPass', ...p })),
      // The players who pass ball2 first set off after that pass, so the balls start together.
      ...(['a4', 'a2', 'a5'] as const).map((id, i) => ({ ...runPlay.changes.find((c) => c.marker === id)!, after: { pass: `p${13 + i}` } })),
    ],
  };

  it('lets every player pass, run to the cone and back, and be passed to again', () => {
    const script = circle([runPlay]);
    const step = stepOf(script, 1);
    const { passes } = positionsAt(step, 0);
    expect(passes).toHaveLength(12);
    for (const flight of passes) {
      const { positions } = positionsAt(step, flight.land);
      expect(positions.ball.x).toBeCloseTo(positions[flight.to].x);
      expect(positions.ball.y).toBeCloseTo(positions[flight.to].y);
    }
    // The first pass is caught on a3's starting cell, though a3 runs after its own pass.
    expect(passes[0].end).toEqual({ x: 15, y: 13 });
  });

  it('adds a second ball opposite the first and runs both at once', () => {
    const step = stepOf(circle([runPlay, secondBall], ['ball', 'ball2']), 2);
    expect(step.markers.filter((m) => m.kind === 'ball').map((m) => m.holder)).toEqual(['a1', 'a4']);
    const { passes, duration } = positionsAt(step, 0);
    expect(passes.filter((p) => p.ball === 'ball')).toHaveLength(12);
    expect(passes.filter((p) => p.ball === 'ball2')).toHaveLength(12);
    expect(passes.find((p) => p.id === 'p13')!.fire).toBe(0);
    const early = positionsAt(step, 0.5).positions;
    expect(early.ball).not.toEqual({ x: 10, y: 4 });
    expect(early.ball2).not.toEqual({ x: 10, y: 16 });
    // Twice round: each ball comes back to the player who started with it.
    const end = positionsAt(step, duration + 1).positions;
    expect(end.ball).toEqual(end.a1);
    expect(end.ball2).toEqual(end.a4);
  });

  it('leaves the single-ball Steps as they were when a second ball is added later', () => {
    const before = positionsAt(stepOf(circle([runPlay]), 1), 3);
    expect(positionsAt(stepOf(circle([runPlay, secondBall], ['ball', 'ball2']), 1), 3)).toEqual(before);
  });
});

describe('more than one ball', () => {
  /** Six players in a row; b1 with a1, b2 with a4. */
  const twoBalls = (passes: unknown[], extra: { markers?: unknown[]; b2Holder?: string; progressions?: unknown[] } = {}) => ({
    schemaVersion: 1,
    area: { width: 40, length: 10 },
    markers: [
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `a${n}`, kind: 'attacker' })),
      { id: 'b1', kind: 'ball' },
      { id: 'b2', kind: 'ball' },
      ...(extra.markers ?? []),
    ],
    base: {
      placements: [
        ...[1, 2, 3, 4, 5, 6].map((n) => ({ marker: `a${n}`, cell: { x: n * 4, y: 0 } })),
        { marker: 'b1', holder: 'a1' },
        { marker: 'b2', holder: extra.b2Holder ?? 'a4' },
      ],
      passes,
    },
    progressions: extra.progressions ?? [],
  });

  it('gives each ball its own chain, and may leave out the ball for the first one', () => {
    const script = twoBalls([
      { id: 'p1', from: 'a1', to: 'a2' },
      { id: 'p2', ball: 'b2', from: 'a4', to: 'a5' },
      { id: 'p3', from: 'a2', to: 'a3' },
      { id: 'p4', ball: 'b2', from: 'a5', to: 'a6' },
    ]);
    const { passes } = positionsAt(stepOf(script), 0);
    expect(passes.map((p) => `${p.id}:${p.ball}`)).toEqual(['p1:b1', 'p2:b2', 'p3:b1', 'p4:b2']);
    // The balls run at the same time.
    expect(passes[0].fire).toBe(0);
    expect(passes[1].fire).toBe(0);
    const end = positionsAt(stepOf(script), 99).positions;
    expect(end.b1).toEqual(end.a3);
    expect(end.b2).toEqual(end.a6);
  });

  it('names the ball when the passer does not hold it', () => {
    expect(errorsOf(twoBalls([{ id: 'p1', ball: 'b2', from: 'a1', to: 'a2' }]))).toEqual([
      'base.passes[0].from: marker "a1" does not hold ball "b2" when this pass fires; "a4" does',
    ]);
  });

  it('rejects a pass of something that is not a ball', () => {
    expect(errorsOf(twoBalls([{ id: 'p1', ball: 'a1', from: 'a1', to: 'a2' }]))).toEqual([
      'base.passes[0].ball: marker "a1" is not a ball',
    ]);
  });

  it('rejects two balls in one pair of hands at the start', () => {
    expect(errorsOf(twoBalls([], { b2Holder: 'a1' }))).toEqual([
      'base.placements[7].holder: marker "a1" already holds ball "b1"; a player cannot hold two balls at once',
    ]);
  });

  it('rejects a catch by a player still holding the other ball', () => {
    const script = twoBalls([
      { id: 'p1', from: 'a1', to: 'a2' },
      { id: 'p2', ball: 'b2', from: 'a4', to: 'a2' },
    ]);
    expect(errorsOf(script)).toEqual([
      'base.passes[1].to: marker "a2" catches ball "b2" while still holding ball "b1"; a player cannot hold two balls at once',
    ]);
  });

  it('allows passing one ball on before the other arrives', () => {
    const script = twoBalls([
      { id: 'p1', from: 'a1', to: 'a2' },
      { id: 'p2', from: 'a2', to: 'a3' },
      { id: 'p3', ball: 'b2', from: 'a4', to: 'a2' },
    ]);
    expect(validate(script).ok).toBe(true);
  });

  it('caps the number of balls', () => {
    const script = twoBalls([], { markers: [{ id: 'b3', kind: 'ball' }, { id: 'b4', kind: 'ball' }] });
    expect(errorsOf(script)).toContain('markers[9].kind: a Practice has at most 3 balls');
  });

  it('lets a Progression add a ball and its passes, and change them with setPass', () => {
    const script = twoBalls([{ id: 'p1', from: 'a1', to: 'a2' }], {
      progressions: [
        { lever: 'equipment', changes: [{ type: 'addMarker', marker: 'b2', holder: 'a4' }, { type: 'setPass', id: 'p2', ball: 'b2', from: 'a4', to: 'a5' }] },
        { lever: 'people', changes: [{ type: 'setPass', id: 'p2', ball: 'b2', from: 'a4', to: 'a6' }] },
      ],
    });
    // b2 is not placed in the base Step: only the first Progression brings it on.
    script.base.placements = script.base.placements.filter((p) => p.marker !== 'b2');
    expect(stepOf(script, 0).markers.some((m) => m.id === 'b2')).toBe(false);
    expect(stepOf(script, 1).passes.map((p) => p.to)).toEqual(['a2', 'a5']);
    expect(stepOf(script, 2).passes.map((p) => p.to)).toEqual(['a2', 'a6']);
  });
});
