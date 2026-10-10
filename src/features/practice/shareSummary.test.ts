import { describe, expect, it } from 'vitest';
import { buildShareDescription, SHARE_DESCRIPTION_MAX } from './shareSummary';
import { validate } from './engine';
import type { PracticeScript } from './schema';

/**
 * A valid script whose base Step holds the given marker kinds (each on its own cell)
 * and which has `progressions` empty Progressions.
 */
function scriptWith(kinds: string[], progressions = 0): PracticeScript {
  const markers = kinds.map((kind, i) => ({ id: `m${i}`, kind }));
  const placements = kinds.map((kind, i) => (kind === 'ball' ? { marker: `m${i}`, cell: { x: 0, y: 0 } } : { marker: `m${i}`, cell: { x: i, y: 1 } }));
  const result = validate({
    schemaVersion: 1,
    area: { width: 40, length: 30 },
    markers,
    base: { placements },
    progressions: Array.from({ length: progressions }, () => ({ changes: [] })),
  });
  if (!result.ok) throw new Error(`fixture invalid: ${JSON.stringify(result.errors)}`);
  return result.script;
}

describe('buildShareDescription', () => {
  const script = scriptWith(['attacker', 'attacker', 'attacker', 'defender', 'ball', 'cone'], 2);

  it('uses the Practice description when short', () => {
    expect(buildShareDescription({ description: '  Two-touch passing  ' }, script)).toBe('Two-touch passing');
  });

  it('trims a long description to the limit with an ellipsis at a word boundary', () => {
    const long = 'word '.repeat(80).trim();
    const out = buildShareDescription({ description: long }, script);
    expect(out.length).toBeLessThanOrEqual(SHARE_DESCRIPTION_MAX);
    expect(out.endsWith('…')).toBe(true);
    expect(out.slice(0, -1)).toMatch(/^(word )*word$/);
  });

  it('collapses whitespace before measuring', () => {
    expect(buildShareDescription({ description: 'a\n\n  b\tc' }, script)).toBe('a b c');
  });

  it('summarises players and Progressions when there is no description', () => {
    expect(buildShareDescription({ description: null }, script)).toBe('4 players · 2 Progressions');
    expect(buildShareDescription({ description: '   ' }, script)).toBe('4 players · 2 Progressions');
  });

  it('uses singular forms for counts of one', () => {
    expect(buildShareDescription({ description: undefined }, scriptWith(['attacker', 'ball'], 1))).toBe('1 player · 1 Progression');
  });

  it('does not count coaches, balls or cones as players', () => {
    expect(buildShareDescription({ description: null }, scriptWith(['coach', 'cone', 'ball']))).toBe('0 players · 0 Progressions');
  });
});
