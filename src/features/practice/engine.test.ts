import { describe, it, expect } from 'vitest';
import {
  validate,
  resolveStep,
  stepCount,
  positionsAt,
  formatError,
  MAX_SCRIPT_BYTES,
  PACE_SPEEDS_MPS,
  DEFAULT_PACE,
  PASS_SPEED_MPS,
} from './engine';
import passingSquare from './examples/passing-square.json';
import withProgressions from './examples/passing-square-progressions.json';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function errorsOf(input: unknown): string[] {
  const result = validate(input);
  if (result.ok) throw new Error('expected validation to fail');
  return result.errors.map(formatError);
}

function stepOf(input: unknown) {
  const result = validate(input);
  if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
  return resolveStep(result.script, 0);
}

function straightRun(distance: number) {
  return {
    schemaVersion: 1,
    area: { width: 40, length: 10 },
    markers: [{ id: 'a1', kind: 'attacker' }],
    base: {
      placements: [{ marker: 'a1', cell: { x: 0, y: 0 } }],
      moves: [{ marker: 'a1', waypoints: [{ x: distance, y: 0 }] }],
    },
  };
}

const jog = PACE_SPEEDS_MPS[DEFAULT_PACE];

describe('validate', () => {
  it('accepts the passing square example, as an object or as pasted text', () => {
    expect(validate(passingSquare).ok).toBe(true);
    expect(validate(JSON.stringify(passingSquare)).ok).toBe(true);
  });

  it('rejects an unknown schema version', () => {
    expect(errorsOf({ ...passingSquare, schemaVersion: 2 })).toEqual([
      'schemaVersion: unsupported schemaVersion 2; this app reads schemaVersion 1',
    ]);
  });

  it('rejects an oversized script', () => {
    const big = { ...passingSquare, title: 'x'.repeat(MAX_SCRIPT_BYTES) };
    expect(errorsOf(big)[0]).toMatch(/too large/);
    expect(errorsOf(JSON.stringify(big))[0]).toMatch(/too large/);
  });

  it('rejects a move that references a missing marker, naming the field', () => {
    const script = clone(passingSquare);
    script.base.moves[1].marker = 'a9';
    expect(errorsOf(script)).toEqual(['base.moves[1].marker: no marker with id "a9"']);
  });

  it('rejects text that is not JSON', () => {
    expect(errorsOf('{ not json')[0]).toMatch(/^not valid JSON/);
  });

  it('names the path of structural errors', () => {
    const script = clone(passingSquare) as Record<string, unknown> & typeof passingSquare;
    delete (script.area as Partial<typeof script.area>).width;
    (script.markers[0] as Record<string, unknown>).kind = 'tackle-bag';
    const errors = errorsOf(script);
    expect(errors).toContain('area.width: is required');
    expect(errors.some((e) => e.startsWith('markers[0].kind: '))).toBe(true);
  });

  it('rejects a waypoint outside the Area', () => {
    const script = clone(passingSquare);
    script.base.moves[0].waypoints[0] = { x: 12, y: 0 };
    expect(errorsOf(script)[0]).toMatch(/^base\.moves\[0\]\.waypoints\[0\]: cell \(12, 0\) is outside/);
  });

  it('rejects a marker with no placement', () => {
    const script = clone(passingSquare);
    script.base.placements.shift();
    expect(errorsOf(script)).toEqual([
      'markers[0]: marker "c1" is never on the Area: place it in base.placements or add it in a Progression',
    ]);
  });
});

describe('positionsAt', () => {
  it('starts every marker on its placement cell', () => {
    const { positions } = positionsAt(stepOf(passingSquare), 0);
    expect(positions.a1).toEqual({ x: 1, y: 10 });
    expect(positions.c3).toEqual({ x: 10, y: 10 });
  });

  it('derives duration from distance at the default Pace', () => {
    expect(positionsAt(stepOf(straightRun(10)), 0).duration).toBeCloseTo(10 / jog);
    expect(positionsAt(stepOf(straightRun(20)), 0).duration).toBeCloseTo(20 / jog);
  });

  it('moves at a steady Pace', () => {
    const step = stepOf(straightRun(20));
    const { duration } = positionsAt(step, 0);
    const samples = [0.25, 0.5, 0.75].map((f) => positionsAt(step, duration * f).positions.a1.x);
    expect(samples[0]).toBeCloseTo(5);
    expect(samples[1]).toBeCloseTo(10);
    expect(samples[2]).toBeCloseTo(15);
  });

  it('passes through waypoints in order without stopping', () => {
    const script = straightRun(10);
    script.base.moves[0].waypoints = [{ x: 4, y: 0 }, { x: 4, y: 3 }];
    const step = stepOf(script);
    expect(positionsAt(step, 0).duration).toBeCloseTo(7 / jog);
    expect(positionsAt(step, 4 / jog).positions.a1).toEqual({ x: 4, y: 0 });
    const after = positionsAt(step, 5 / jog).positions.a1;
    expect(after.x).toBeCloseTo(4);
    expect(after.y).toBeCloseTo(1);
  });

  it('leaves markers at rest on cells once the Step has played', () => {
    const step = stepOf(passingSquare);
    const { duration } = positionsAt(step, 0);
    const { positions } = positionsAt(step, duration + 1);
    expect(positions.a1).toEqual({ x: 1, y: 1 });
    expect(positions.a2).toEqual({ x: 10, y: 1 });
    for (const p of Object.values(positions)) {
      expect(Number.isInteger(p.x) && Number.isInteger(p.y)).toBe(true);
    }
  });
});

describe('resolveStep', () => {
  it('rejects a Step that does not exist', () => {
    const result = validate(passingSquare);
    if (!result.ok) throw new Error('example should be valid');
    expect(() => resolveStep(result.script, 1)).toThrow(RangeError);
  });
});

describe('Progressions', () => {
  function scriptOf(input: unknown) {
    const result = validate(input);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    return result.script;
  }

  function stepsOf(input: unknown) {
    const script = scriptOf(input);
    return Array.from({ length: stepCount(script) }, (_, n) => resolveStep(script, n));
  }

  const ids = (step: ReturnType<typeof resolveStep>) => step.markers.map((m) => m.id);

  it('accepts the example and counts the base plus every Progression', () => {
    expect(stepCount(scriptOf(withProgressions))).toBe(3);
    expect(stepCount(scriptOf(passingSquare))).toBe(1);
  });

  it('carries an edit to the base forward into every later Step', () => {
    const script = clone(withProgressions);
    script.base.placements.find((p) => p.marker === 'c1')!.cell = { x: 0, y: 0 };
    for (const step of stepsOf(script)) {
      expect(step.markers.find((m) => m.id === 'c1')!.cell).toEqual({ x: 0, y: 0 });
    }
  });

  it('applies changes over the previous Step, keeping what is not changed', () => {
    const [base, crossover, defended] = stepsOf(withProgressions);
    expect(base.moves.find((m) => m.marker === 'a1')!.waypoints).toEqual([{ x: 1, y: 1 }]);
    expect(crossover.moves.find((m) => m.marker === 'a1')!.waypoints).toEqual([{ x: 10, y: 1 }]);
    expect(defended.moves.find((m) => m.marker === 'a1')!.waypoints).toEqual([{ x: 10, y: 1 }]);
  });

  it('shows an added defender from its Progression onward', () => {
    const [base, crossover, defended] = stepsOf(withProgressions);
    expect(ids(base)).not.toContain('d1');
    expect(ids(crossover)).not.toContain('d1');
    expect(defended.markers.find((m) => m.id === 'd1')!.cell).toEqual({ x: 6, y: 1 });
    expect(positionsAt(defended, 0).positions.d1).toEqual({ x: 6, y: 1 });
  });

  it('removes a marker, and its move, from its Progression onward', () => {
    const script = clone(withProgressions) as { progressions: Array<{ changes: unknown[] }> };
    script.progressions[0].changes.push({ type: 'removeMarker', marker: 'c3' });
    script.progressions[1].changes.push({ type: 'removePass', id: 'p1' });
    script.progressions[1].changes.push({ type: 'removePass', id: 'p2' });
    script.progressions[1].changes.push({ type: 'removeMarker', marker: 'a2' });
    const [base, crossover, defended] = stepsOf(script);
    expect(ids(base)).toContain('c3');
    expect(ids(crossover)).not.toContain('c3');
    expect(ids(defended)).not.toContain('c3');
    expect(crossover.moves.map((m) => m.marker)).toContain('a2');
    expect(defended.moves.map((m) => m.marker)).not.toContain('a2');
    expect(defended.passes).toEqual([]);
  });

  it('gives each Step its own Lever and Commentary', () => {
    const [base, crossover, defended] = stepsOf(withProgressions);
    expect(base.index).toBe(0);
    expect(base.lever).toBeUndefined();
    expect(base.commentary.points[0]).toMatch(/target/);
    expect(crossover.lever).toBe('time');
    expect(crossover.commentary.points[0]).toMatch(/cross/);
    expect(defended.index).toBe(2);
    expect(defended.lever).toBe('people');
    expect(defended.commentary.points[0]).toMatch(/defender/);
  });

  it('rejects a change to a marker not on the Area at that Step, naming the field', () => {
    const script = clone(withProgressions) as { progressions: Array<{ changes: unknown[] }> };
    script.progressions[0].changes.push({ type: 'setMove', marker: 'd1', waypoints: [{ x: 2, y: 2 }] });
    expect(errorsOf(script)).toEqual([
      'progressions[0].changes[2].marker: marker "d1" is not on the Area in the previous Step',
    ]);
  });

  it('rejects removing a marker that is already gone, and adding one already present', () => {
    const script = clone(withProgressions) as { progressions: Array<{ changes: unknown[] }> };
    script.progressions[0].changes.push({ type: 'removeMarker', marker: 'c1' });
    script.progressions[1].changes.push({ type: 'removeMarker', marker: 'c1' });
    script.progressions[1].changes.push({ type: 'addMarker', marker: 'a1', cell: { x: 3, y: 3 } });
    expect(errorsOf(script)).toEqual([
      'progressions[1].changes[3].marker: marker "c1" is not on the Area in the previous Step',
      'progressions[1].changes[4].marker: marker "a1" is already on the Area in the previous Step',
    ]);
  });

  it('rejects a change naming an unknown marker or a cell outside the Area', () => {
    const script = clone(withProgressions) as { progressions: Array<{ changes: unknown[] }> };
    script.progressions[1].changes.push({ type: 'removeMove', marker: 'zz' });
    script.progressions[1].changes.push({ type: 'placeMarker', marker: 'c2', cell: { x: 12, y: 0 } });
    const errors = errorsOf(script);
    expect(errors[0]).toBe('progressions[1].changes[3].marker: no marker with id "zz"');
    expect(errors[1]).toMatch(/^progressions\[1\]\.changes\[4\]\.cell: cell \(12, 0\) is outside/);
  });

  it('rejects a Progression without a Lever', () => {
    const script = clone(withProgressions) as { progressions: Array<Record<string, unknown>> };
    delete script.progressions[1].lever;
    expect(errorsOf(script)).toEqual(['progressions[1].lever: is required']);
  });
});

describe('Motion: Pace, ball and passes', () => {
  type Base = { moves?: unknown[]; passes?: unknown[]; placements?: unknown[] };

  /** a1, a2 and a3 ten metres apart on row 0; a1 holds the ball; a cone at (0, 10). */
  function drill(base: Base = {}, progressions: unknown[] = []) {
    return {
      schemaVersion: 1,
      area: { width: 40, length: 20 },
      markers: [
        { id: 'a1', kind: 'attacker' },
        { id: 'a2', kind: 'attacker' },
        { id: 'a3', kind: 'attacker' },
        { id: 'ball', kind: 'ball' },
        { id: 'c1', kind: 'cone' },
      ],
      base: {
        placements: base.placements ?? [
          { marker: 'a1', cell: { x: 0, y: 0 } },
          { marker: 'a2', cell: { x: 10, y: 0 } },
          { marker: 'a3', cell: { x: 20, y: 0 } },
          { marker: 'ball', holder: 'a1' },
          { marker: 'c1', cell: { x: 0, y: 10 } },
        ],
        moves: base.moves ?? [],
        passes: base.passes ?? [],
      },
      progressions,
    };
  }

  const at = (input: unknown, t: number, n = 0) => {
    const result = validate(input);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    return positionsAt(resolveStep(result.script, n), t);
  };

  it('keeps every Pace slower than real time, with speeds as named constants', () => {
    expect(PACE_SPEEDS_MPS.walk).toBeLessThan(1.4);
    expect(PACE_SPEEDS_MPS.jog).toBeLessThan(3);
    expect(PACE_SPEEDS_MPS.sprint).toBeLessThan(8);
    expect(PACE_SPEEDS_MPS.walk).toBeLessThan(PACE_SPEEDS_MPS.jog);
    expect(PACE_SPEEDS_MPS.jog).toBeLessThan(PACE_SPEEDS_MPS.sprint);
    expect(PASS_SPEED_MPS).toBeLessThan(15);
    expect(DEFAULT_PACE).toBe('jog');
  });

  it('derives duration from distance and the Pace of each move', () => {
    const run = (pace?: string) =>
      drill({ moves: [{ marker: 'c1', waypoints: [{ x: 12, y: 10 }], ...(pace ? { pace } : {}) }] });
    expect(at(run(), 0).duration).toBeCloseTo(12 / PACE_SPEEDS_MPS.jog);
    expect(at(run('walk'), 0).duration).toBeCloseTo(12 / PACE_SPEEDS_MPS.walk);
    expect(at(run('sprint'), 0).duration).toBeCloseTo(12 / PACE_SPEEDS_MPS.sprint);
  });

  it('rejects an unknown Pace and a typed duration', () => {
    const script = drill({ moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 5 }], pace: 'run', duration: 3 }] });
    const errors = errorsOf(script);
    expect(errors.some((e) => e.startsWith('base.moves[0].pace: '))).toBe(true);
    expect(errors).toContain('base.moves[0]: unknown field "duration"');
  });

  it('carries the ball with its holder', () => {
    const script = drill({ moves: [{ marker: 'a1', waypoints: [{ x: 0, y: 8 }] }] });
    for (const t of [0, 1, 2.5, 99]) {
      const { positions } = at(script, t);
      expect(positions.ball).toEqual(positions.a1);
    }
  });

  it('requires the ball to start with a holder who can carry it', () => {
    const onCell = drill({
      placements: [
        { marker: 'a1', cell: { x: 0, y: 0 } },
        { marker: 'a2', cell: { x: 10, y: 0 } },
        { marker: 'a3', cell: { x: 20, y: 0 } },
        { marker: 'ball', cell: { x: 1, y: 0 } },
        { marker: 'c1', holder: 'a1' },
      ],
    });
    expect(errorsOf(onCell)).toEqual([
      'base.placements[3].cell: the ball is not placed on a cell; give "holder" instead: the id of the marker carrying it',
      'base.placements[4].holder: only the ball has a holder',
      'markers[3]: marker "ball" is never on the Area: place it in base.placements or add it in a Progression',
      'markers[4]: marker "c1" is never on the Area: place it in base.placements or add it in a Progression',
    ]);
    const byCone = drill();
    (byCone.base.placements[3] as { holder: string }).holder = 'c1';
    expect(errorsOf(byCone)).toEqual([
      'base.placements[3].holder: marker "c1" is a cone; only attackers, defenders and coaches handle the ball',
    ]);
  });

  it('fires a pass to a stationary receiver straight away, flying at the pass speed', () => {
    const script = drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2' }] });
    const flight = 10 / PASS_SPEED_MPS;
    const { duration, passes } = at(script, 0);
    expect(passes).toEqual([
      { id: 'p1', from: 'a1', to: 'a2', start: { x: 0, y: 0 }, end: { x: 10, y: 0 }, fire: 0, land: flight },
    ]);
    expect(duration).toBeCloseTo(flight);
    expect(at(script, flight / 2).positions.ball.x).toBeCloseTo(5);
    expect(at(script, flight + 1).positions.ball).toEqual({ x: 10, y: 0 });
  });

  it('fires a pass when the receiver arrives at its cell, not before', () => {
    const script = drill({
      moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 6 }] }],
      passes: [{ id: 'p1', from: 'a1', to: 'a2' }],
    });
    const arrive = 6 / jog;
    const { passes, duration } = at(script, 0);
    expect(passes[0].fire).toBeCloseTo(arrive);
    expect(passes[0].end).toEqual({ x: 10, y: 6 });
    expect(duration).toBeCloseTo(arrive + Math.hypot(10, 6) / PASS_SPEED_MPS);
    expect(at(script, arrive - 0.01).positions.ball).toEqual({ x: 0, y: 0 });
    expect(at(script, arrive + 0.1).positions.ball.x).toBeGreaterThan(0);
    expect(at(script, duration).positions.ball).toEqual({ x: 10, y: 6 });
  });

  it('chains passes: each fires only once the previous one is caught', () => {
    const script = drill({
      passes: [
        { id: 'p1', from: 'a1', to: 'a2' },
        { id: 'p2', from: 'a2', to: 'a3' },
      ],
    });
    const { passes, duration } = at(script, 0);
    expect(passes[1].fire).toBeCloseTo(passes[0].land);
    expect(duration).toBeCloseTo(20 / PASS_SPEED_MPS);
    expect(at(script, duration).positions.ball).toEqual({ x: 20, y: 0 });
  });

  it('rejects a pass from a marker that does not hold the ball at that moment', () => {
    const script = drill({
      passes: [
        { id: 'p1', from: 'a1', to: 'a2' },
        { id: 'p2', from: 'a1', to: 'a3' },
      ],
    });
    expect(errorsOf(script)).toEqual([
      'base.passes[1].from: marker "a1" does not hold the ball when this pass fires; "a2" does',
    ]);
  });

  it('rejects passes to unknown markers, to cones, to oneself, and without a ball', () => {
    expect(errorsOf(drill({ passes: [{ id: 'p1', from: 'a1', to: 'zz' }] }))).toEqual([
      'base.passes[0].to: no marker with id "zz"',
    ]);
    expect(errorsOf(drill({ passes: [{ id: 'p1', from: 'a1', to: 'c1' }] }))).toEqual([
      'base.passes[0].to: marker "c1" is a cone; only attackers, defenders and coaches handle the ball',
    ]);
    expect(errorsOf(drill({ passes: [{ id: 'p1', from: 'a1', to: 'a1' }] }))).toEqual([
      'base.passes[0].to: a marker cannot pass to itself',
    ]);
    const noBall = drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2' }] });
    noBall.markers.splice(3, 1);
    noBall.base.placements.splice(3, 1);
    expect(errorsOf(noBall)).toEqual(['base.passes[0].from: there is no ball on the Area in this Step']);
  });

  it('starts a move after another move completes', () => {
    const script = drill({
      moves: [
        { marker: 'a1', waypoints: [{ x: 0, y: 4 }] },
        { marker: 'a3', waypoints: [{ x: 20, y: 6 }], after: { move: 'a1' } },
      ],
    });
    const start = 4 / jog;
    expect(at(script, start).positions.a3).toEqual({ x: 20, y: 0 });
    expect(at(script, start + 1).positions.a3.y).toBeCloseTo(jog);
    expect(at(script, 0).duration).toBeCloseTo(start + 6 / jog);
  });

  it('starts a move after a pass is caught, the passer throwing from its starting cell', () => {
    const script = drill({
      moves: [{ marker: 'a1', waypoints: [{ x: 0, y: 8 }], pace: 'sprint', after: { pass: 'p1' } }],
      passes: [{ id: 'p1', from: 'a1', to: 'a2' }],
    });
    const land = 10 / PASS_SPEED_MPS;
    const { passes, duration } = at(script, 0);
    expect(passes[0].start).toEqual({ x: 0, y: 0 });
    expect(at(script, land).positions.a1).toEqual({ x: 0, y: 0 });
    expect(duration).toBeCloseTo(land + 8 / PACE_SPEEDS_MPS.sprint);
  });

  it('rejects a move waiting on something that is not in the Step', () => {
    const script = drill({
      moves: [
        { marker: 'a2', waypoints: [{ x: 10, y: 4 }], after: { pass: 'p9' } },
        { marker: 'a3', waypoints: [{ x: 20, y: 4 }], after: { move: 'a1', pass: 'p9' } },
        { marker: 'a1', waypoints: [{ x: 0, y: 4 }], after: { move: 'c1' } },
      ],
    });
    expect(errorsOf(script)).toEqual([
      'base.moves[0].after.pass: no pass "p9" in this Step',
      'base.moves[1].after: give exactly one of "move" or "pass"',
      'base.moves[2].after.move: marker "c1" has no move in this Step',
    ]);
  });

  it('rejects waits that loop', () => {
    const moves = drill({
      moves: [
        { marker: 'a1', waypoints: [{ x: 0, y: 4 }], after: { move: 'a2' } },
        { marker: 'a2', waypoints: [{ x: 10, y: 4 }], after: { move: 'a1' } },
      ],
    });
    expect(errorsOf(moves)).toEqual([
      'base.moves[0].after: moves and passes wait on each other in a loop: the move of "a1" waits for the move of "a2", which waits for the move of "a1"',
    ]);
    const receiverWaits = drill({
      moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 4 }], after: { pass: 'p1' } }],
      passes: [{ id: 'p1', from: 'a1', to: 'a2' }],
    });
    expect(errorsOf(receiverWaits)).toEqual([
      'base.moves[0].after: moves and passes wait on each other in a loop: the move of "a2" waits for pass "p1", which waits for the move of "a2"',
    ]);
  });

  it('rejects a move for the ball', () => {
    expect(errorsOf(drill({ moves: [{ marker: 'ball', waypoints: [{ x: 3, y: 3 }] }] }))).toEqual([
      'base.moves[0].marker: the ball does not run on its own; it moves with its holder or on a pass',
    ]);
  });

  it('lets Progressions set and remove passes, and set Pace and waits on moves', () => {
    const script = drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2' }] }, [
      {
        lever: 'time',
        changes: [
          { type: 'setPass', id: 'p2', from: 'a2', to: 'a3' },
          { type: 'setMove', marker: 'a3', waypoints: [{ x: 20, y: 4 }], pace: 'walk', after: { pass: 'p1' } },
        ],
      },
      {
        lever: 'people',
        changes: [
          { type: 'removePass', id: 'p2' },
          { type: 'removeMove', marker: 'a3' },
          { type: 'setPass', id: 'p1', from: 'a1', to: 'a3' },
        ],
      },
    ]);
    const [base, second, third] = [0, 1, 2].map((n) => at(script, 0, n));
    expect(base.passes.map((p) => p.id)).toEqual(['p1']);
    expect(second.passes.map((p) => `${p.id}:${p.from}>${p.to}`)).toEqual(['p1:a1>a2', 'p2:a2>a3']);
    const a3Arrives = 10 / PASS_SPEED_MPS + 4 / PACE_SPEEDS_MPS.walk;
    expect(second.passes[1].fire).toBeCloseTo(a3Arrives);
    expect(third.passes.map((p) => `${p.id}:${p.from}>${p.to}`)).toEqual(['p1:a1>a3']);
  });

  it('names the change when a Progression breaks the ball chain or makes a loop', () => {
    const script = drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2' }] }, [
      { lever: 'time', changes: [{ type: 'setPass', id: 'p2', from: 'a1', to: 'a3' }] },
      { lever: 'people', changes: [{ type: 'removePass', id: 'p9' }] },
    ]);
    expect(errorsOf(script)).toEqual([
      'progressions[0].changes[0].from: marker "a1" does not hold the ball when this pass fires; "a2" does',
      'progressions[1].changes[0].id: no pass "p9" in the previous Step',
    ]);
    const loop = drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2' }] }, [
      { lever: 'time', changes: [{ type: 'setMove', marker: 'a2', waypoints: [{ x: 10, y: 4 }], after: { pass: 'p1' } }] },
    ]);
    expect(errorsOf(loop)[0]).toMatch(/^progressions\[0\]\.changes\[0\]\.after: moves and passes wait on each other in a loop/);
  });

  it('plays both examples with the ball ending on the last receiver', () => {
    for (const example of [passingSquare, withProgressions]) {
      const result = validate(example);
      if (!result.ok) throw new Error('example should be valid');
      for (let n = 0; n < stepCount(result.script); n++) {
        const step = resolveStep(result.script, n);
        const { duration, passes } = positionsAt(step, 0);
        expect(passes.length).toBeGreaterThan(0);
        const end = positionsAt(step, duration).positions;
        expect(end.ball).toEqual(end[passes[passes.length - 1].to]);
      }
    }
  });
});
