import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { positionsAt, resolveStep, validate, warnings, formatError } from '@/features/practice/engine';
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
    // 1 and 2 pass on the run and keep going rather than stopping to pass.
    expect(result.script.base.passes.map((p) => p.release)).toEqual([0, 1]);
    expect(result.script.base.passes[1].after).toEqual({ move: 'd2' });
    for (let n = 0; n < 2; n++) {
      const step = resolveStep(result.script, n);
      const [p1, p2] = positionsAt(step, 0).passes;
      expect(positionsAt(step, p1.fire + 0.5).positions.a1.y).toBeLessThan(p1.start.y);
      expect(positionsAt(step, p2.fire - 0.2).positions.a2).not.toEqual(positionsAt(step, p2.fire).positions.a2);
    }
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

  it('09-pass-and-support.json releases on the run, the passer runs on in support, with no warning', () => {
    const result = validate(readFileSync(path.join(EXAMPLES_DIR, '09-pass-and-support.json'), 'utf8'));
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.script.base.passes[0].release).toBe(0);
    const step = resolveStep(result.script, 0);
    const [p1] = positionsAt(step, 0).passes;
    // The ball leaves 1 on the release waypoint and 1 runs on to support.
    expect(p1.start).toEqual({ x: 8, y: 13 });
    expect(positionsAt(step, p1.land + 0.5).positions.a1.y).toBeLessThan(13);
    expect(positionsAt(step, Infinity).positions.a1).toEqual({ x: 11, y: 11 });
    expect(warnings(result.script)).toEqual([]);
  });

  it('the landing 3 v 2 attacks up, passes as D2 is drawn in, and raises no warning', () => {
    const result = validate(HERO_SCRIPT);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    expect(result.script.direction).toBe('up');
    expect(warnings(result.script)).toEqual([]);
    // D2 is drawn onto 2: within a couple of metres as the ball goes, but not in contact.
    const step = resolveStep(result.script, 0);
    const p2 = positionsAt(step, 0).passes[1];
    const at = positionsAt(step, p2.fire).positions;
    const gap = Math.hypot(at.a2.x - at.d2.x, at.a2.y - at.d2.y);
    expect(gap).toBeGreaterThan(1.2);
    expect(gap).toBeLessThan(2.5);
  });

  it('the landing 3 v 2 flows: everyone sets off at once, passes go on the run, 3 jogs then sprints', () => {
    const result = validate(HERO_SCRIPT);
    if (!result.ok) throw new Error(result.errors.map(formatError).join('\n'));
    const { moves, passes } = result.script.base;
    // Every player has a Run and none waits on another: the line advances together.
    expect(moves.map((m) => m.marker).sort()).toEqual(['a1', 'a2', 'a3', 'd1', 'd2']);
    expect(moves.every((m) => m.after === undefined)).toBe(true);
    // Both passes are Released part way along the carrier's Run and caught on the run.
    expect(passes.map((p) => [p.release, p.at])).toEqual([
      [0, 0],
      [1, 1],
    ]);
    const a3 = moves.find((m) => m.marker === 'a3')!;
    expect(a3.pace).toBe('jog');
    expect(a3.waypoints.map((w) => w.pace)).toEqual([undefined, 'sprint', 'sprint']);

    const step = resolveStep(result.script, 0);
    const at = (t: number) => positionsAt(step, t);
    const { duration } = at(0);
    expect(duration).toBeGreaterThan(8);
    expect(duration).toBeLessThan(12);
    // All three attackers are moving half a second in.
    for (const id of ['a1', 'a2', 'a3']) expect(at(0.5).positions[id]).not.toEqual(at(0).positions[id]);
    // 1 and 2 run on after passing; 3 finishes upfield with the ball.
    const [p1, p2] = at(0).passes;
    expect(at(p1.fire + 0.5).positions.a1.y).toBeLessThan(p1.start.y);
    expect(at(p2.fire + 0.5).positions.a2.y).toBeLessThan(p2.start.y);
    expect(at(duration).positions.ball).toEqual(at(duration).positions.a3);
    expect(at(duration).positions.a3.y).toBeLessThan(6);
    // No quiet finish: every player is still moving 1.5 s before the end (support and cover runs).
    const late = duration - 1.5;
    for (const id of ['a1', 'a2', 'a3', 'd1', 'd2']) {
      const [p, q] = [at(late).positions[id], at(late + 0.1).positions[id]];
      expect(Math.hypot(q.x - p.x, q.y - p.y), id).toBeGreaterThan(0.05);
    }
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
