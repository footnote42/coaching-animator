import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  formatError,
  KICK_ROLL_M,
  KICK_ROLL_S,
  KICK_SPEED_MPS,
  positionsAt,
  resolveStep,
  validate,
  warnings,
} from './engine';
import { drawOrder } from './drawOrder';
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

/** A 20 x 20 Area attacking up: a1 holds the ball at (10, 15), a2 stands at (4, 15), d1 at (10, 2). */
function field(base: Base = {}, progressions: unknown[] = []) {
  return {
    schemaVersion: 1,
    area: { width: 20, length: 20 },
    direction: 'up',
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'a2', kind: 'attacker' },
      { id: 'd1', kind: 'defender' },
      { id: 'ball', kind: 'ball' },
      { id: 'shield1', kind: 'tackle-shield' },
    ],
    base: {
      placements: base.placements ?? [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 4, y: 15 } },
        { marker: 'd1', cell: { x: 10, y: 2 } },
        { marker: 'ball', holder: 'a1' },
        { marker: 'shield1', cell: { x: 0, y: 0 } },
      ],
      moves: base.moves ?? [],
      passes: base.passes ?? [],
    },
    progressions,
  };
}

const kickUp = (extra: Record<string, unknown> = {}) => ({ id: 'k1', from: 'a1', cell: { x: 10, y: 5 }, kick: true, ...extra });
const stepOf = (input: unknown, n = 0) => resolveStep(valid(input), n);

describe('Kick to space', () => {
  const flightTime = 10 / KICK_SPEED_MPS;

  it('flies to the cell, lands there, rolls on in the kick’s direction and lies loose', () => {
    const step = stepOf(field({ passes: [kickUp()] }));
    const { duration, passes } = positionsAt(step, 0);
    expect(passes).toEqual([
      {
        id: 'k1',
        ball: 'ball',
        from: 'a1',
        start: { x: 10, y: 15 },
        end: { x: 10, y: 5 },
        kick: true,
        fire: 0,
        land: flightTime,
        roll: { to: { x: 10, y: 5 - KICK_ROLL_M }, until: flightTime + KICK_ROLL_S },
      },
    ]);
    // The Step plays to the end of the roll.
    expect(duration).toBeCloseTo(flightTime + KICK_ROLL_S);

    expect(positionsAt(step, flightTime / 2).positions.ball).toEqual({ x: 10, y: 10 });
    expect(positionsAt(step, flightTime).positions.ball).toEqual({ x: 10, y: 5 });
    // Half way through the roll it has covered three quarters of it: it slows to a stop.
    const mid = positionsAt(step, flightTime + KICK_ROLL_S / 2).positions.ball;
    expect(mid.x).toBeCloseTo(10);
    expect(mid.y).toBeCloseTo(5 - KICK_ROLL_M * 0.75);
    // At rest, and it stays there; the kicker stays put without it.
    for (const t of [duration, duration + 5]) {
      const { positions } = positionsAt(step, t);
      expect(positions.ball.x).toBeCloseTo(10);
      expect(positions.ball.y).toBeCloseTo(5 - KICK_ROLL_M);
      expect(positions.a1).toEqual({ x: 10, y: 15 });
    }
  });

  it('rolls along a diagonal kick and stops at the edge of the Area', () => {
    const diagonal = positionsAt(stepOf(field({ passes: [kickUp({ cell: { x: 16, y: 7 } })] })), 0).passes[0];
    // From (10, 15) to (16, 7) is a 3-4-5 line, 10 m long.
    expect(diagonal.roll!.to.x).toBeCloseTo(16 + KICK_ROLL_M * 0.6);
    expect(diagonal.roll!.to.y).toBeCloseTo(7 - KICK_ROLL_M * 0.8);

    const toEdge = positionsAt(stepOf(field({ passes: [kickUp({ cell: { x: 10, y: 1 } })] })), 0).passes[0];
    expect(toEdge.roll!.to).toEqual({ x: 10, y: 0 });
  });

  it('waits for "after" like any pass, and a chaser can set off when it lands', () => {
    const step = stepOf(
      field({
        moves: [
          { marker: 'a1', waypoints: [{ x: 10, y: 13 }] },
          { marker: 'a2', waypoints: [{ x: 10, y: 3 }], after: { pass: 'k1' } },
        ],
        passes: [kickUp({ after: { move: 'a1' } })],
      }),
    );
    const { duration, passes } = positionsAt(step, 0);
    const [k1] = passes;
    expect(k1.fire).toBeGreaterThan(0);
    expect(k1.start).toEqual({ x: 10, y: 13 });
    expect(positionsAt(step, k1.land).positions.a2).toEqual({ x: 4, y: 15 });
    expect(positionsAt(step, k1.land + 0.5).positions.a2).not.toEqual({ x: 4, y: 15 });
    // The chaser does not pick the ball up: Collect is not part of a Kick to space.
    const end = positionsAt(step, duration).positions;
    expect(end.ball.y).toBeCloseTo(3);
    expect(end.a2).toEqual({ x: 10, y: 3 });
  });

  it('never raises a forward-pass warning, however far forward it goes', () => {
    expect(warnings(valid(field({ passes: [kickUp({ cell: { x: 10, y: 0 } })] })))).toEqual([]);
  });

  it('lets the kicker catch another ball once the first is kicked away', () => {
    const script = field({
      placements: [
        { marker: 'a1', cell: { x: 10, y: 15 } },
        { marker: 'a2', cell: { x: 4, y: 15 } },
        { marker: 'd1', cell: { x: 10, y: 2 } },
        { marker: 'ball', holder: 'a1' },
        { marker: 'ball2', holder: 'a2' },
        { marker: 'shield1', cell: { x: 0, y: 0 } },
      ],
      moves: [{ marker: 'a2', waypoints: [{ x: 4, y: 16 }], after: { pass: 'k1' } }],
      passes: [kickUp(), { id: 'p1', ball: 'ball2', from: 'a2', to: 'a1' }],
    });
    script.markers.push({ id: 'ball2', kind: 'ball' });
    valid(script);
  });

  it('needs exactly one of "to" or "cell", only on a kick, with no "at"', () => {
    expect(errorsOf(field({ passes: [kickUp({ to: 'a2' })] }))).toEqual([
      'base.passes[0].to: give exactly one of "to" (the receiver) or "cell" (a Kick to space)',
    ]);
    expect(errorsOf(field({ passes: [{ id: 'k1', from: 'a1', kick: true }] }))).toEqual([
      'base.passes[0].to: give exactly one of "to" (the receiver) or "cell" (a Kick to space)',
    ]);
    expect(errorsOf(field({ passes: [kickUp({ kick: undefined })] }))).toEqual([
      'base.passes[0].cell: only a kick goes to space; add "kick": true, or give "to" for a pass to a receiver',
    ]);
    expect(errorsOf(field({ passes: [kickUp({ at: 0 })] }))).toEqual([
      'base.passes[0].at: a Kick to space has no receiver to catch on the run; leave out "at"',
    ]);
  });

  it('must land inside the Area, including after a Progression shrinks it', () => {
    expect(errorsOf(field({ passes: [kickUp({ cell: { x: 25, y: 5 } })] }))).toEqual([
      'base.passes[0].cell: cell (25, 5) is outside the 20 x 20 m Area; columns run 0-19 and rows 0-19',
    ]);
    valid(field({ passes: [kickUp({ cell: { x: 10, y: 2 } })] }, [{ lever: 'space', changes: [{ type: 'setArea', width: 20, length: 18 }] }]));
    expect(errorsOf(field({ passes: [kickUp({ cell: { x: 10, y: 19 } })] }, [{ lever: 'space', changes: [{ type: 'setArea', width: 20, length: 18 }] }]))).toEqual([
      'progressions[0].changes[0]: pass "k1" is kicked to cell (10, 19), outside the new 20 x 18 m Area; change or remove it in this Progression',
    ]);
    expect(errorsOf(field({}, [
      {
        lever: 'space',
        changes: [
          { type: 'setArea', width: 12, length: 20 },
          { type: 'placeMarker', marker: 'a1', cell: { x: 10, y: 15 } },
          { type: 'placeMarker', marker: 'd1', cell: { x: 10, y: 2 } },
          { type: 'setPass', id: 'k1', from: 'a1', cell: { x: 14, y: 5 }, kick: true },
        ],
      },
    ]))).toEqual([
      'progressions[0].changes[3].cell: cell (14, 5) is outside the 12 x 20 m Area; columns run 0-11 and rows 0-19',
    ]);
  });

  it('leaves the ball loose: no pass of it can follow until it is Collected', () => {
    expect(errorsOf(field({ passes: [kickUp(), { id: 'p2', from: 'a1', to: 'a2' }] }))).toEqual([
      'base.passes[1].from: the ball lies loose after the Kick to space "k1", so nobody holds it to pass when this pass fires',
    ]);
  });

  it('is set by a Progression', () => {
    const script = valid(field({}, [{ lever: 'time', changes: [{ type: 'setPass', ...kickUp() }] }]));
    expect(positionsAt(resolveStep(script, 0), 0).passes).toEqual([]);
    expect(positionsAt(resolveStep(script, 1), 0).passes[0].roll).toBeDefined();
  });
});

describe('a ball that starts loose', () => {
  const loosePlacements = (ball: Record<string, unknown>) => [
    { marker: 'a1', cell: { x: 10, y: 15 } },
    { marker: 'a2', cell: { x: 4, y: 15 } },
    { marker: 'd1', cell: { x: 10, y: 2 } },
    { marker: 'ball', ...ball },
    { marker: 'shield1', cell: { x: 3, y: 4 }, lying: true },
  ];

  it('lies on its cell for the whole Step while players run past', () => {
    const step = stepOf(field({ placements: loosePlacements({ cell: { x: 3, y: 4 } }), moves: [{ marker: 'a1', waypoints: [{ x: 3, y: 4 }] }] }));
    const ball = step.markers.find((m) => m.id === 'ball')!;
    expect(ball.cell).toEqual({ x: 3, y: 4 });
    expect(ball.holder).toBeUndefined();
    const { duration } = positionsAt(step, 0);
    expect(duration).toBeGreaterThan(0);
    for (const t of [0, duration / 2, duration]) expect(positionsAt(step, t).positions.ball).toEqual({ x: 3, y: 4 });
  });

  it('is drawn beneath Lying kit on the same cell, and on top elsewhere', () => {
    const under = stepOf(field({ placements: loosePlacements({ cell: { x: 3, y: 4 } }) }));
    const { positions, passes } = positionsAt(under, 0);
    expect(drawOrder(under.markers, positions, passes, 0)[0]).toEqual({ marker: expect.objectContaining({ id: 'ball' }), underKit: true });

    const apart = stepOf(field({ placements: loosePlacements({ cell: { x: 8, y: 4 } }) }));
    const order = drawOrder(apart.markers, positionsAt(apart, 0).positions, [], 0);
    expect(order[order.length - 1]).toEqual({ marker: expect.objectContaining({ id: 'ball' }), underKit: false });
  });

  it('a ball kicked to space onto Lying kit comes to rest beneath it', () => {
    const step = stepOf(field({ placements: loosePlacements({ holder: 'a1' }).map((p) => (p.marker === 'shield1' ? { ...p, cell: { x: 10, y: 3 } } : p)), passes: [kickUp()] }));
    const { duration, positions, passes } = positionsAt(step, 100);
    expect(drawOrder(step.markers, positions, passes, duration)[0]).toEqual({ marker: expect.objectContaining({ id: 'ball' }), underKit: true });
  });

  it('cannot be passed: nobody holds it', () => {
    expect(errorsOf(field({ placements: loosePlacements({ cell: { x: 3, y: 4 } }), passes: [{ id: 'p1', from: 'a1', to: 'a2' }] }))).toEqual([
      'base.passes[0].from: the ball lies loose on cell (3, 4), so nobody holds it to pass when this pass fires',
    ]);
  });

  it('must lie inside the Area', () => {
    expect(errorsOf(field({ placements: loosePlacements({ cell: { x: 3, y: 24 } }) }))).toEqual([
      'base.placements[3].cell: cell (3, 24) is outside the 20 x 20 m Area; columns run 0-19 and rows 0-19',
    ]);
  });

  it('is dropped loose or handed back by a Progression with placeMarker, and added loose with addMarker', () => {
    const script = valid(field({}, [
      { lever: 'equipment', changes: [{ type: 'placeMarker', marker: 'ball', cell: { x: 0, y: 0 } }] },
      { lever: 'equipment', changes: [{ type: 'placeMarker', marker: 'ball', holder: 'a2' }] },
    ]));
    const ballIn = (n: number) => resolveStep(script, n).markers.find((m) => m.id === 'ball');
    expect(ballIn(0)).toMatchObject({ holder: 'a1', cell: { x: 10, y: 15 } });
    expect(ballIn(1)?.holder).toBeUndefined();
    expect(ballIn(1)?.cell).toEqual({ x: 0, y: 0 });
    expect(ballIn(2)).toMatchObject({ holder: 'a2', cell: { x: 4, y: 15 } });

    const added = field({ placements: loosePlacements({ holder: 'a1' }).filter((p) => p.marker !== 'ball') }, [
      { lever: 'equipment', changes: [{ type: 'addMarker', marker: 'ball', cell: { x: 5, y: 5 } }] },
    ]);
    expect(resolveStep(valid(added), 1).markers.find((m) => m.id === 'ball')?.cell).toEqual({ x: 5, y: 5 });
  });
});

describe('skill example 07-kick-to-space.json', () => {
  it('kicks to space, lands and rolls, with a ball starting loose under a Lying shield, and no warning', () => {
    const file = path.join(process.cwd(), 'skill', 'coaching-animator', 'examples', '07-kick-to-space.json');
    const script = valid(readFileSync(file, 'utf8'));
    const kicks = positionsAt(resolveStep(script, 0), 0).passes.filter((f) => f.roll);
    expect(kicks).toHaveLength(1);
    const loose = resolveStep(script, 1).markers.filter((m) => m.kind === 'ball' && m.holder === undefined);
    expect(loose.length).toBeGreaterThan(0);
    expect(warnings(script)).toEqual([]);
  });
});
