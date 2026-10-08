import { describe, it, expect } from 'vitest';
import { addProgression, applyEdit, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

const edits = (script: PracticeScript, ...list: Edit[]) => list.reduce((s, edit) => ok(applyEdit(s, edit)), script);
const stepEdits = (script: PracticeScript, n: number, ...list: Edit[]) =>
  list.reduce((s, edit) => ok(applyStepEdit(s, n, edit)), script);
const lyingOf = (script: PracticeScript, step: number, id: string) =>
  resolveStep(script, step).markers.find((m) => m.id === id)?.lying;

const base = edits(
  emptyScript(),
  { type: 'addMarker', kind: 'tackle-shield', at: { x: 4, y: 4 } },
  { type: 'addMarker', kind: 'cone', at: { x: 1, y: 1 } },
);

describe('applyEdit: setLying', () => {
  it('toggles Lying on a tackle shield, and the script stays valid', () => {
    const down = edits(base, { type: 'setLying', marker: 'shield1', lying: true });
    expect(down.base.placements[0]).toEqual({ marker: 'shield1', cell: { x: 4, y: 4 }, lying: true });
    expect(validate(down).ok).toBe(true);

    const up = edits(down, { type: 'setLying', marker: 'shield1', lying: false });
    expect(up.base.placements[0]).toEqual({ marker: 'shield1', cell: { x: 4, y: 4 } });
  });

  it('returns the same script when nothing changes', () => {
    expect(applyEdit(base, { type: 'setLying', marker: 'shield1', lying: false })).toBe(base);
  });

  it('refuses other kinds with a reason', () => {
    expect(applyEdit(base, { type: 'setLying', marker: 'cone1', lying: true })).toMatch(/Only a tackle shield/);
    expect(applyEdit(base, { type: 'setLying', marker: 'nope', lying: true })).toMatch(/No marker/);
  });

  it('keeps a shield Lying when it is dragged', () => {
    const moved = edits(
      base,
      { type: 'setLying', marker: 'shield1', lying: true },
      { type: 'moveMarker', marker: 'shield1', at: { x: 6, y: 6 } },
    );
    expect(moved.base.placements[0]).toEqual({ marker: 'shield1', cell: { x: 6, y: 6 }, lying: true });
  });
});

describe('Progressions: Lying', () => {
  it('records laying a shield down as a placeMarker change; the base stays upright', () => {
    const script = stepEdits(addProgression(base, 'equipment'), 1, { type: 'setLying', marker: 'shield1', lying: true });
    expect(script.progressions[0].changes).toEqual([
      { type: 'placeMarker', marker: 'shield1', cell: { x: 4, y: 4 }, lying: true },
    ]);
    expect(lyingOf(script, 0, 'shield1')).toBeUndefined();
    expect(lyingOf(script, 1, 'shield1')).toBe(true);
    expect(validate(script).ok).toBe(true);
  });

  it('records standing a Lying shield back up as a placeMarker without lying', () => {
    const lying = edits(base, { type: 'setLying', marker: 'shield1', lying: true });
    const script = stepEdits(addProgression(lying, 'equipment'), 1, { type: 'setLying', marker: 'shield1', lying: false });
    expect(script.progressions[0].changes).toEqual([{ type: 'placeMarker', marker: 'shield1', cell: { x: 4, y: 4 } }]);
    expect(lyingOf(script, 0, 'shield1')).toBe(true);
    expect(lyingOf(script, 1, 'shield1')).toBeUndefined();
  });

  it('keeps a Lying shield Lying when it is dragged in a later Step', () => {
    const lying = edits(base, { type: 'setLying', marker: 'shield1', lying: true });
    const script = stepEdits(addProgression(lying, 'space'), 1, { type: 'moveMarker', marker: 'shield1', at: { x: 7, y: 7 } });
    expect(script.progressions[0].changes).toEqual([
      { type: 'placeMarker', marker: 'shield1', cell: { x: 7, y: 7 }, lying: true },
    ]);
    expect(lyingOf(script, 1, 'shield1')).toBe(true);
  });

  it('a toggle down then up in one Progression leaves no change', () => {
    const script = stepEdits(
      addProgression(base, 'equipment'),
      1,
      { type: 'setLying', marker: 'shield1', lying: true },
      { type: 'setLying', marker: 'shield1', lying: false },
    );
    expect(script.progressions[0].changes).toEqual([]);
  });
});
