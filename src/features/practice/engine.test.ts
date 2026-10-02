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
    script.base.placements.pop();
    expect(errorsOf(script)).toEqual([
      'markers[6]: marker "ball" is never on the Area: place it in base.placements or add it in a Progression',
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
    script.progressions[0].changes.push({ type: 'removeMarker', marker: 'a2' });
    const [base, crossover, defended] = stepsOf(script);
    expect(ids(base)).toContain('c3');
    expect(ids(crossover)).not.toContain('c3');
    expect(ids(defended)).not.toContain('c3');
    expect(crossover.moves.map((m) => m.marker)).not.toContain('a2');
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
      'progressions[1].changes[2].marker: marker "c1" is not on the Area in the previous Step',
      'progressions[1].changes[3].marker: marker "a1" is already on the Area in the previous Step',
    ]);
  });

  it('rejects a change naming an unknown marker or a cell outside the Area', () => {
    const script = clone(withProgressions) as { progressions: Array<{ changes: unknown[] }> };
    script.progressions[1].changes.push({ type: 'removeMove', marker: 'zz' });
    script.progressions[1].changes.push({ type: 'placeMarker', marker: 'c2', cell: { x: 12, y: 0 } });
    const errors = errorsOf(script);
    expect(errors[0]).toBe('progressions[1].changes[2].marker: no marker with id "zz"');
    expect(errors[1]).toMatch(/^progressions\[1\]\.changes\[3\]\.cell: cell \(12, 0\) is outside/);
  });

  it('rejects a Progression without a Lever', () => {
    const script = clone(withProgressions) as { progressions: Array<Record<string, unknown>> };
    delete script.progressions[1].lever;
    expect(errorsOf(script)).toEqual(['progressions[1].lever: is required']);
  });
});
