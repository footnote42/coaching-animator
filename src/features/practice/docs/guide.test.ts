import { describe, it, expect } from 'vitest';
import { validate, resolveStep, positionsAt } from '@/features/practice/engine';
import { GUIDE_EXAMPLES, loadGuide, renderGuide } from '@/features/practice/docs/guide';
import passingSquareProgressions from '@/features/practice/examples/passing-square-progressions.json';
import halfPitchPlay from '@/features/practice/examples/half-pitch-play.json';

const ORIGIN = 'https://example.test';

describe('Practice Script guide', () => {
  const guide = loadGuide(ORIGIN);

  it('fills every token', () => {
    expect(guide).not.toMatch(/\{\{/);
    expect(guide).toContain(`${ORIGIN}/practice-script/v1/schema.json`);
  });

  it('embeds every worked example verbatim from its example file', () => {
    for (const script of Object.values(GUIDE_EXAMPLES)) {
      expect(guide).toContain(JSON.stringify(script, null, 2));
    }
  });

  it('rejects an unknown token', () => {
    expect(() => renderGuide('{{NOPE}}', ORIGIN)).toThrow(/Unknown token/);
  });
});

describe('worked examples', () => {
  it('passing square has two Progressions and validates', () => {
    const result = validate(passingSquareProgressions);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.script.progressions).toHaveLength(2);
  });

  it('half-pitch play uses the half-pitch template, validates and plays every pass', () => {
    const result = validate(halfPitchPlay);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.script.area.template).toBe('half-pitch');
    const { passes, positions, duration } = positionsAt(resolveStep(result.script, 0), Infinity);
    expect(passes.map((p) => p.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(duration).toBeGreaterThan(0);
    // The ball ends with the last receiver.
    expect(positions.ball).toEqual(positions.a14);
    // The 14 is led on its run but reaches its last waypoint before the ball
    // does, so the catch is the last thing in the Step until receivers are
    // timed to the ball (#144).
    expect(passes[3].land).toBeLessThanOrEqual(duration);
  });
});
