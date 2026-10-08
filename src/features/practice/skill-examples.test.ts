import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveStep, validate, warnings, formatError } from '@/features/practice/engine';
import { HERO_SCRIPT } from '@/app/_components/heroScript';
import { PRACTICE_TAGS } from '@/lib/practice-tags';

const SKILL_DIR = path.join(process.cwd(), 'skill', 'coaching-animator');
const EXAMPLES_DIR = path.join(SKILL_DIR, 'examples');
const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.json'));

describe('skill worked examples', () => {
  it('has at least three examples', () => {
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  it.each(files)('%s validates with the engine', (file) => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, file), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.ok).toBe(true);
  });

  it('04-attack-v-defence.json attacks up and raises no warning', () => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, '04-attack-v-defence.json'), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.script.direction).toBe('up');
    expect(warnings(result.script)).toEqual([]);
    // 3 jogs wide, then sprints onto the ball: Pace per waypoint segment.
    const a3 = result.script.base.moves.find((m) => m.marker === 'a3')!;
    expect(a3.pace).toBe('jog');
    expect(a3.waypoints.map((w) => w.pace)).toEqual([undefined, 'sprint', 'sprint']);
  });

  it('05-kick-receipt.json kicks to the other team, who counter-attack backward, with no warning', () => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, '05-kick-receipt.json'), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join(', '));
    expect(result.script.base.passes[0].kick).toBe(true);
    expect(result.script.direction).toBe('up');
    expect(warnings(result.script)).toEqual([]);
  });

  it('07-bag-clear-out.json lays the tackle bag flat over the ball in its Progression, with no warning', () => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, '07-bag-clear-out.json'), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    const bag = (step: number) => resolveStep(result.script, step).markers.find((m) => m.id === 'bag1');
    expect(bag(0)).toMatchObject({ kind: 'tackle-bag' });
    expect(bag(0)?.lying).toBeUndefined();
    expect(bag(1)?.lying).toBe(true);
    expect(resolveStep(result.script, 1).markers.find((m) => m.id === 'ball')?.cell).toEqual(bag(1)?.cell);
    expect(warnings(result.script)).toEqual([]);
  });

  it('the landing 3 v 2 attacks up, passes on D2 arriving, and raises no warning', () => {
    const result = validate(HERO_SCRIPT);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.script.base.passes[1].after).toEqual({ move: 'd2' });
    expect(warnings(result.script)).toEqual([]);
  });
});

describe('SKILL.md', () => {
  const skill = readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');

  it('has name and description frontmatter', () => {
    expect(skill).toMatch(/^---\r?\nname: coaching-animator\r?\ndescription: .+/);
  });

  it('lists every fixed Tag, so it cannot drift from the app', () => {
    for (const tag of PRACTICE_TAGS) expect(skill).toContain(tag);
  });
});
