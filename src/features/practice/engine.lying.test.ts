import { describe, it, expect } from 'vitest';
import { formatError, resolveStep, validate } from './engine';
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

function ruck(changes: unknown[] = [], shieldPlacement: Record<string, unknown> = { lying: true }) {
  return {
    schemaVersion: 1,
    area: { width: 10, length: 10 },
    markers: [
      { id: 'a1', kind: 'attacker' },
      { id: 'shield1', kind: 'tackle-shield' },
      { id: 'cone1', kind: 'cone' },
      { id: 'ball', kind: 'ball' },
    ],
    base: {
      placements: [
        { marker: 'a1', cell: { x: 4, y: 4 } },
        { marker: 'shield1', cell: { x: 4, y: 4 }, ...shieldPlacement },
        { marker: 'cone1', cell: { x: 0, y: 0 } },
        { marker: 'ball', holder: 'a1' },
      ] as Array<Record<string, unknown>>,
    },
    progressions: changes.length > 0 ? [{ lever: 'equipment', changes }] : [],
  };
}

const lyingOf = (script: PracticeScript, step: number, id: string) =>
  resolveStep(script, step).markers.find((m) => m.id === id)?.lying;

describe('Lying', () => {
  it('lays a tackle shield flat for the Step', () => {
    const script = valid(ruck());
    expect(lyingOf(script, 0, 'shield1')).toBe(true);
    expect(lyingOf(script, 0, 'a1')).toBeUndefined();
  });

  it('leaves a shield upright when lying is left out or false', () => {
    expect(lyingOf(valid(ruck([], {})), 0, 'shield1')).toBeUndefined();
    expect(lyingOf(valid(ruck([], { lying: false })), 0, 'shield1')).toBeUndefined();
  });

  it('refuses Lying on any other kind', () => {
    const cone = ruck();
    cone.base.placements[2] = { marker: 'cone1', cell: { x: 0, y: 0 }, lying: true };
    expect(errorsOf(cone)).toEqual(['base.placements[2].lying: only a tackle shield can be Lying; marker "cone1" is a cone']);

    const player = ruck();
    player.base.placements[0] = { marker: 'a1', cell: { x: 4, y: 4 }, lying: false };
    expect(errorsOf(player)).toEqual(['base.placements[0].lying: only a tackle shield can be Lying; marker "a1" is a attacker']);

    const ball = ruck();
    ball.base.placements[3] = { marker: 'ball', holder: 'a1', lying: true };
    expect(errorsOf(ball)[0]).toMatch(/^base\.placements\[3\]\.lying: only a tackle shield/);

    expect(errorsOf(ruck([{ type: 'placeMarker', marker: 'cone1', cell: { x: 0, y: 0 }, lying: true }]))).toEqual([
      'progressions[0].changes[0].lying: only a tackle shield can be Lying; marker "cone1" is a cone',
    ]);
  });

  it('is set by a Progression and carries forward', () => {
    const script = valid(ruck([{ type: 'placeMarker', marker: 'shield1', cell: { x: 4, y: 4 }, lying: true }], {}));
    expect(lyingOf(script, 0, 'shield1')).toBeUndefined();
    expect(lyingOf(script, 1, 'shield1')).toBe(true);
  });

  it('is cleared by a Progression that places the shield without it', () => {
    const script = valid(ruck([{ type: 'placeMarker', marker: 'shield1', cell: { x: 5, y: 4 } }]));
    expect(lyingOf(script, 0, 'shield1')).toBe(true);
    expect(lyingOf(script, 1, 'shield1')).toBeUndefined();
  });

  it('can be given to a shield added by a Progression', () => {
    const script = valid({
      ...ruck(),
      base: { placements: ruck().base.placements.filter((p) => p.marker !== 'shield1') },
      progressions: [{ lever: 'equipment', changes: [{ type: 'addMarker', marker: 'shield1', cell: { x: 2, y: 2 }, lying: true }] }],
    });
    expect(lyingOf(script, 1, 'shield1')).toBe(true);
  });
});
