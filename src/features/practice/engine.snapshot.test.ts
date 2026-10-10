import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { positionsAt, resolveStep, stepCount, validate, warnings, formatError, formatWarning } from '@/features/practice/engine';
import { HERO_SCRIPT } from '@/app/_components/heroScript';

/**
 * Characterisation snapshot (#204): validate result, warnings and timings at
 * fixed sample times for every shipped example script. Guards the holds work
 * (#192) against changing how existing scripts play.
 */
const SKILL_DIR = path.join(process.cwd(), 'skill', 'coaching-animator', 'examples');
const GUIDE_DIR = path.join(process.cwd(), 'src', 'features', 'practice', 'examples');

const load = (dir: string, file: string): unknown => JSON.parse(readFileSync(path.join(dir, file), 'utf8'));

const sources: Array<[string, unknown]> = [
  ...readdirSync(SKILL_DIR).filter((f) => f.endsWith('.json')).sort().map((f): [string, unknown] => [`skill/${f}`, load(SKILL_DIR, f)]),
  ...readdirSync(GUIDE_DIR).filter((f) => f.endsWith('.json')).sort().map((f): [string, unknown] => [`guide/${f}`, load(GUIDE_DIR, f)]),
  ['hero', HERO_SCRIPT],
];

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const FRACTIONS = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1];

function characterise(input: unknown) {
  const result = validate(input);
  if (!result.ok) return { ok: false, errors: result.errors.map(formatError) };
  const steps = [];
  for (let n = 0; n < stepCount(result.script); n++) {
    const step = resolveStep(result.script, n);
    const { duration, passes } = positionsAt(step, 0);
    const times = [...new Set([...FRACTIONS.map((f) => r3(f * duration)), ...passes.flatMap((p) => [r3(p.fire), r3(p.land)])])].sort((a, b) => a - b);
    steps.push({
      duration: r3(duration),
      passes: passes.map((p) => ({ id: p.id, fire: r3(p.fire), land: r3(p.land) })),
      samples: times.map((t) => {
        const at = positionsAt(step, t);
        return {
          t,
          positions: Object.fromEntries(Object.entries(at.positions).map(([id, p]) => [id, [r3(p.x), r3(p.y)]])),
        };
      }),
    });
  }
  return { ok: true, warnings: warnings(result.script).map(formatWarning), steps };
}

describe('example timings snapshot', () => {
  it('covers every shipped example', () => {
    expect(sources.map(([name]) => name)).toMatchSnapshot();
  });

  it.each(sources)('%s', (_name, script) => {
    expect(characterise(script)).toMatchSnapshot();
  });
});

// Scripts exercising each wait spelling, including ones validation refuses.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;
const base = (): Loose => JSON.parse(JSON.stringify(load(SKILL_DIR, '09-pass-and-support.json')));
const variants: Array<[string, (s: Loose) => void]> = [
  ['move after move', (s) => { s.base.moves[1].after = { move: 'a1' }; }],
  ['move after pass', (s) => { s.base.moves[2].after = { pass: 'p1' }; }],
  ['pass after move', (s) => { s.base.passes[0].after = { move: 'd1' }; }],
  ['receiver waits on its own pass', (s) => { s.base.moves[1].after = { pass: 'p1' }; }],
  ['move after both', (s) => { s.base.moves[1].after = { move: 'a1', pass: 'p1' }; }],
  ['move after neither', (s) => { s.base.moves[1].after = {}; }],
  ['move after unknown move', (s) => { s.base.moves[1].after = { move: 'zz' }; }],
  ['move after unknown pass', (s) => { s.base.moves[1].after = { pass: 'zz' }; }],
  ['pass after unknown move', (s) => { s.base.passes[0].after = { move: 'zz' }; }],
  ['move wait loop', (s) => { s.base.moves[0].after = { move: 'a2' }; s.base.moves[1].after = { move: 'a1' }; }],
  ['pass wait loop', (s) => { s.base.moves[0].after = { pass: 'p1' }; }],
  ['pass after passer own move', (s) => { s.base.passes[0].after = { move: 'a1' }; }],
];

describe('wait variants snapshot', () => {
  it.each(variants)('%s', (_name, mutate) => {
    const script = base();
    mutate(script);
    expect(characterise(script)).toMatchSnapshot();
  });
});
