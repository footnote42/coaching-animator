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
  RUN_ACCELERATION_MPS2,
  RUN_TAPER_MPS2,
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

/**
 * Seconds a Run takes over `metres` at `speed`, worked out here rather than by the
 * engine: it speeds up from rest at RUN_ACCELERATION_MPS2, holds its Pace (or peaks
 * below it on a short Run) and tapers to a stop at RUN_TAPER_MPS2.
 */
function runSeconds(metres: number, speed: number = jog): number {
  const a = RUN_ACCELERATION_MPS2;
  const d = RUN_TAPER_MPS2;
  const peak = Math.min(speed, Math.sqrt((2 * metres * a * d) / (a + d)));
  const cruise = metres - (peak * peak) / (2 * a) - (peak * peak) / (2 * d);
  return peak / a + cruise / peak + peak / d;
}

/** Seconds to cover `metres` of a Run that has reached its Pace and not yet begun to taper. */
function cruiseSeconds(metres: number, speed: number = jog): number {
  return metres / speed + speed / (2 * RUN_ACCELERATION_MPS2);
}

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
    (script.markers[0] as Record<string, unknown>).kind = 'tackle-dummy';
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

  it('derives duration from distance at the default Pace, with time to speed up and taper', () => {
    expect(positionsAt(stepOf(straightRun(10)), 0).duration).toBeCloseTo(runSeconds(10));
    expect(positionsAt(stepOf(straightRun(20)), 0).duration).toBeCloseTo(runSeconds(20));
  });

  it('passes through waypoints in order without stopping', () => {
    const script = straightRun(10);
    script.base.moves[0].waypoints = [{ x: 4, y: 0 }, { x: 4, y: 3 }];
    const step = stepOf(script);
    expect(positionsAt(step, 0).duration).toBeCloseTo(runSeconds(7));
    const corner = positionsAt(step, cruiseSeconds(4)).positions.a1;
    expect(corner.x).toBeCloseTo(4);
    expect(corner.y).toBeCloseTo(0);
    const after = positionsAt(step, cruiseSeconds(5)).positions.a1;
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

describe('Run easing', () => {
  /** a1 jogs 20 m along the x axis from rest. */
  const step = () => stepOf(straightRun(20));
  const xAt = (t: number) => positionsAt(step(), t).positions.a1.x;

  it('keeps acceleration and taper as named constants', () => {
    expect(RUN_ACCELERATION_MPS2).toBeGreaterThan(0);
    expect(RUN_TAPER_MPS2).toBeGreaterThan(0);
  });

  it('starts from rest: covers less ground at first than at constant Pace, then reaches its Pace', () => {
    const reachPace = jog / RUN_ACCELERATION_MPS2;
    expect(xAt(0)).toBe(0);
    // Half a second in: 0.5 a t^2 metres, against jog * 0.5 at constant Pace.
    expect(xAt(reachPace / 2)).toBeCloseTo(0.5 * RUN_ACCELERATION_MPS2 * (reachPace / 2) ** 2);
    expect(xAt(reachPace / 2)).toBeLessThan(jog * (reachPace / 2));
    // Speeding up costs jog / 2a metres of ground against a runner already at Pace.
    expect(xAt(reachPace)).toBeCloseTo(jog * reachPace - jog * reachPace / 2);
  });

  it('holds its Pace through the middle of the Run', () => {
    const t = cruiseSeconds(8);
    expect(xAt(t)).toBeCloseTo(8);
    expect(xAt(t + 1) - xAt(t)).toBeCloseTo(jog);
    expect(xAt(cruiseSeconds(10))).toBeCloseTo(10);
  });

  it('slows over its final stretch and stops exactly on its last waypoint', () => {
    const { duration } = positionsAt(step(), 0);
    // One second out it is 0.5 d metres short, moving at d m/s, slower than its Pace.
    expect(xAt(duration - 1)).toBeCloseTo(20 - 0.5 * RUN_TAPER_MPS2);
    expect(xAt(duration - 0.5) - xAt(duration - 1)).toBeLessThan(jog * 0.5);
    expect(xAt(duration - 0.1) - xAt(duration - 0.2)).toBeLessThan(xAt(duration - 1) - xAt(duration - 1.1));
    expect(positionsAt(step(), duration).positions.a1).toEqual({ x: 20, y: 0 });
    expect(positionsAt(step(), duration + 5).positions.a1).toEqual({ x: 20, y: 0 });
  });

  it('never runs faster than its Pace', () => {
    const { duration } = positionsAt(step(), 0);
    for (let t = 0; t < duration; t += 0.1) {
      expect(xAt(t + 0.1) - xAt(t)).toBeLessThanOrEqual(jog * 0.1 + 1e-9);
    }
  });

  it('peaks below its Pace on a Run too short to reach it, still stopping on the waypoint', () => {
    const short = stepOf(straightRun(1));
    const { duration } = positionsAt(short, 0);
    expect(duration).toBeCloseTo(runSeconds(1));
    expect(duration).toBeGreaterThan(1 / jog);
    expect(positionsAt(short, duration / 2).positions.a1.x).toBeGreaterThan(0);
    expect(positionsAt(short, duration).positions.a1).toEqual({ x: 1, y: 0 });
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

  it('resizes the Area from a Space Progression onward', () => {
    const script = clone(withProgressions) as { progressions: Array<{ lever: string; changes: unknown[] }> };
    script.progressions[0].lever = 'space';
    script.progressions[0].changes.push({ type: 'setArea', width: 20, length: 14 });
    const [base, crossover, defended] = stepsOf(script);
    expect(base.area).toEqual({ width: 12, length: 12 });
    expect(crossover.area).toEqual({ width: 20, length: 14 });
    expect(defended.area).toEqual({ width: 20, length: 14 });
  });

  it('checks cells against the Area of the Step that uses them', () => {
    const grown = clone(withProgressions) as { progressions: Array<{ lever: string; changes: unknown[] }> };
    grown.progressions[0].lever = 'space';
    grown.progressions[0].changes.push({ type: 'setArea', template: 'horizontal', width: 20, length: 12 });
    grown.progressions[1].changes.push({ type: 'placeMarker', marker: 'c2', cell: { x: 15, y: 1 } });
    expect(validate(grown).ok).toBe(true);

    // The same cell is outside the base Area when used before the resize.
    const early = clone(grown);
    early.progressions[0].changes.splice(2, 1);
    expect(errorsOf(early)).toEqual([
      expect.stringMatching(/^progressions\[1\]\.changes\[3\]\.cell: cell \(15, 1\) is outside the 12 x 12 m Area/),
    ]);
  });

  it('rejects shrinking the Area under markers carried forward, naming the setArea change', () => {
    const script = clone(withProgressions) as { progressions: Array<{ lever: string; changes: unknown[] }> };
    script.progressions[1].lever = 'space';
    script.progressions[1].changes.push({ type: 'setArea', width: 8, length: 12 });
    const errors = errorsOf(script);
    expect(errors).toContain(
      'progressions[1].changes[3]: marker "c2" starts on cell (10, 1), outside the new 8 x 12 m Area; move or remove it in this Progression',
    );
    expect(errors).toContain(
      'progressions[1].changes[3]: the move of "a1" runs to cell (10, 1), outside the new 8 x 12 m Area; change or remove it in this Progression',
    );
    expect(errors.every((e) => e.startsWith('progressions[1]'))).toBe(true);
  });

  it('only lets a Space Progression change the Area', () => {
    const script = clone(withProgressions) as { progressions: Array<{ changes: unknown[] }> };
    script.progressions[0].changes.push({ type: 'setArea', width: 20, length: 20 });
    expect(errorsOf(script)).toEqual([
      'progressions[0].changes[2].type: only a Progression that pulls the Space lever can change the Area',
    ]);
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
    expect(at(run(), 0).duration).toBeCloseTo(runSeconds(12, PACE_SPEEDS_MPS.jog));
    expect(at(run('walk'), 0).duration).toBeCloseTo(runSeconds(12, PACE_SPEEDS_MPS.walk));
    expect(at(run('sprint'), 0).duration).toBeCloseTo(runSeconds(12, PACE_SPEEDS_MPS.sprint));
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
      { id: 'p1', ball: 'ball', from: 'a1', to: 'a2', start: { x: 0, y: 0 }, end: { x: 10, y: 0 }, fire: 0, land: flight },
    ]);
    expect(duration).toBeCloseTo(flight);
    expect(at(script, flight / 2).positions.ball.x).toBeCloseTo(5);
    expect(at(script, flight + 1).positions.ball).toEqual({ x: 10, y: 0 });
  });

  it('throws to a late receiver so the ball lands as it arrives at its cell', () => {
    const script = drill({
      moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 6 }] }],
      passes: [{ id: 'p1', from: 'a1', to: 'a2' }],
    });
    // Receivers are timed to the ball (#144): the pass no longer waits for a2 to
    // stand on its cell, it goes early enough to arrive with a2.
    const arrive = runSeconds(6);
    const fire = arrive - Math.hypot(10, 6) / PASS_SPEED_MPS;
    const { passes, duration } = at(script, 0);
    expect(passes[0].fire).toBeCloseTo(fire);
    expect(passes[0].land).toBeCloseTo(arrive);
    expect(passes[0].end).toEqual({ x: 10, y: 6 });
    expect(duration).toBeCloseTo(arrive);
    expect(at(script, fire - 0.01).positions.ball).toEqual({ x: 0, y: 0 });
    expect(at(script, fire + 0.1).positions.ball.x).toBeGreaterThan(0);
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
    const start = runSeconds(4);
    expect(at(script, start).positions.a3).toEqual({ x: 20, y: 0 });
    // a3 sets off from rest, so its first second covers 0.5 a metres, not a full jog.
    expect(at(script, start + 1).positions.a3.y).toBeCloseTo(0.5 * RUN_ACCELERATION_MPS2);
    expect(at(script, 0).duration).toBeCloseTo(start + runSeconds(6));
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
    expect(duration).toBeCloseTo(land + runSeconds(8, PACE_SPEEDS_MPS.sprint));
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
    // a3 walks, so it is late even unslowed: p2 goes early enough to land as it arrives (#144).
    const a3Arrives = 10 / PASS_SPEED_MPS + runSeconds(4, PACE_SPEEDS_MPS.walk);
    expect(second.passes[1].fire).toBeCloseTo(a3Arrives - Math.hypot(10, 4) / PASS_SPEED_MPS);
    expect(second.passes[1].land).toBeCloseTo(a3Arrives);
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
    const loop = drill({}, [
      {
        lever: 'time',
        changes: [
          { type: 'setMove', marker: 'a2', waypoints: [{ x: 10, y: 4 }], after: { move: 'a3' } },
          { type: 'setMove', marker: 'a3', waypoints: [{ x: 20, y: 4 }], after: { move: 'a2' } },
        ],
      },
    ]);
    expect(errorsOf(loop)[0]).toMatch(/^progressions\[0\]\.changes\[0\]\.after: moves and passes wait on each other in a loop/);
  });

  describe('catch on the run', () => {
    /** a2 runs down from (10, 0) through (10, 4) to (10, 12) at jog; a1 passes to it. */
    const runOn = (pass: Record<string, unknown> = {}, passes: unknown[] = []) =>
      drill({
        moves: [{ marker: 'a2', waypoints: [{ x: 10, y: 4 }, { x: 10, y: 12 }] }],
        passes: [{ id: 'p1', from: 'a1', to: 'a2', ...pass }, ...passes],
      });

    it('throws so the ball meets the runner on the catch waypoint', () => {
      const script = runOn({ at: 0 });
      const { passes, duration } = at(script, 0);
      const [p1] = passes;
      // Timed to the ball (#144): a2 is late at its own Pace, so the pass goes
      // early and is caught on waypoint 0 as a2 runs through it, not led past it.
      expect(p1.land).toBeCloseTo(cruiseSeconds(4));
      expect(p1.end).toEqual({ x: 10, y: 4 });
      expect(at(script, p1.land).positions.a2.y).toBeCloseTo(4);
      expect(p1.land - p1.fire).toBeCloseTo(Math.hypot(10, 4) / PASS_SPEED_MPS);
      // The receiver keeps running: the Step lasts as long as its whole move.
      expect(duration).toBeCloseTo(runSeconds(12));
    });

    it('carries the ball with the receiver for the rest of its move', () => {
      const script = runOn({ at: 0 });
      const { passes, duration } = at(script, 0);
      for (const t of [passes[0].land + 0.01, (passes[0].land + duration) / 2, duration, 99]) {
        const { positions } = at(script, t);
        expect(positions.ball.x).toBeCloseTo(positions.a2.x);
        expect(positions.ball.y).toBeCloseTo(positions.a2.y);
      }
      expect(at(script, 99).positions.ball).toEqual({ x: 10, y: 12 });
    });

    it('lets the receiver pass on while still running', () => {
      const script = runOn({ at: 0 }, [{ id: 'p2', from: 'a2', to: 'a3' }]);
      const { passes } = at(script, 0);
      const [p1, p2] = passes;
      expect(p2.fire).toBeCloseTo(p1.land);
      // Thrown from where a2 has run to, not from its start or its final cell.
      expect(p2.start.y).toBeCloseTo(p1.end.y);
      expect(p2.end).toEqual({ x: 20, y: 0 });
      const end = at(script, 99).positions;
      expect(end.ball).toEqual({ x: 20, y: 0 });
      expect(end.a2).toEqual({ x: 10, y: 12 });
    });

    it('keeps the default: with no catch waypoint the ball is caught at the end of the move', () => {
      const { passes } = at(runOn(), 0);
      // Lands as a2 arrives rather than firing once a2 stands there (#144).
      expect(passes[0].land).toBeCloseTo(runSeconds(12));
      expect(passes[0].fire).toBeCloseTo(runSeconds(12) - Math.hypot(10, 12) / PASS_SPEED_MPS);
      expect(passes[0].end).toEqual({ x: 10, y: 12 });
    });

    it('rejects a catch waypoint outside the move, or for a receiver with no move', () => {
      expect(errorsOf(runOn({ at: 2 }))).toEqual([
        'base.passes[0].at: waypoint 2 is outside the move of "a2", which has 2 waypoints (0-1)',
      ]);
      expect(errorsOf(drill({ passes: [{ id: 'p1', from: 'a1', to: 'a3', at: 0 }] }))).toEqual([
        'base.passes[0].at: marker "a3" has no move in this Step, so there is nothing to catch on the run; leave out "at" or give "a3" a move',
      ]);
      expect(errorsOf(runOn({ at: -1 }))[0]).toMatch(/^base\.passes\[0\]\.at: /);
      const shortened = drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2' }] }, [
        { lever: 'time', changes: [{ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', at: 1 }] },
      ]);
      expect(errorsOf(shortened)).toEqual([
        'progressions[0].changes[0].at: marker "a2" has no move in this Step, so there is nothing to catch on the run; leave out "at" or give "a2" a move',
      ]);
    });
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

  describe('pass waits for a run (draw and pass)', () => {
    const a3Runs = { marker: 'a3', waypoints: [{ x: 20, y: 10 }] };
    const wait = { after: { move: 'a3' } };

    it('fires when the named run has finished, not before', () => {
      const script = drill({ moves: [a3Runs], passes: [{ id: 'p1', from: 'a1', to: 'a2', ...wait }] });
      const [p1] = at(script, 0).passes;
      expect(p1.fire).toBeCloseTo(runSeconds(10));
      expect(at(script, runSeconds(10) - 0.01).positions.ball).toEqual({ x: 0, y: 0 });
      expect(at(script, 99).positions.ball).toEqual({ x: 10, y: 0 });
      // Without the wait the pass goes at once.
      const free = drill({ moves: [a3Runs], passes: [{ id: 'p1', from: 'a1', to: 'a2' }] });
      expect(at(free, 0).passes[0].fire).toBe(0);
    });

    it('combines with a catch on the run: waits for both', () => {
      const moves = [a3Runs, { marker: 'a2', waypoints: [{ x: 10, y: 4 }, { x: 10, y: 12 }] }];
      const early = drill({ moves, passes: [{ id: 'p1', from: 'a1', to: 'a2', at: 0, after: { move: 'a3' } }] });
      // a2 would reach its catch waypoint (4 cells) before a3 finishes (10 cells),
      // so the pass goes when a3 finishes and a2 is slowed to meet it (#144).
      const [held] = at(early, 0).passes;
      expect(held.fire).toBeCloseTo(runSeconds(10));
      expect(at(early, held.land).positions.a2).toEqual({ x: 10, y: 4 });
      const slow = drill({
        moves: [{ marker: 'a3', waypoints: [{ x: 20, y: 2 }] }, moves[1]],
        passes: [{ id: 'p1', from: 'a1', to: 'a2', at: 0, after: { move: 'a3' } }],
      });
      // a3 finishes first, but the pass still waits for it before going to a2.
      const [p1] = at(slow, 0).passes;
      expect(p1.fire).toBeCloseTo(runSeconds(2));
      expect(at(slow, p1.land).positions.a2.y).toBeCloseTo(4);
    });

    it('rejects a wait on a marker with no run, and loops', () => {
      expect(errorsOf(drill({ passes: [{ id: 'p1', from: 'a1', to: 'a2', ...wait }] }))).toEqual([
        'base.passes[0].after.move: marker "a3" has no move in this Step',
      ]);
      const loop = drill({
        moves: [{ ...a3Runs, after: { pass: 'p1' } }],
        passes: [{ id: 'p1', from: 'a1', to: 'a2', ...wait }],
      });
      expect(errorsOf(loop)[0]).toMatch(/^base\.moves\[0\]\.after: moves and passes wait on each other in a loop/);
    });

    it('is carried by a Progression setPass change', () => {
      const script = drill({ moves: [a3Runs] }, [
        { lever: 'time', changes: [{ type: 'setPass', id: 'p1', from: 'a1', to: 'a2', ...wait }] },
      ]);
      expect(at(script, 0, 1).passes[0].fire).toBeCloseTo(runSeconds(10));
    });
  });
});
