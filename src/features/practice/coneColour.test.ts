import { describe, it, expect } from 'vitest';
import { applyEdit, emptyScript } from '@/features/practice/editing';
import { validate } from '@/features/practice/engine';
import { markerColour } from '@/features/practice/markerColour';
import { CONE_COLOURS, MarkerSchema, type PracticeScript } from '@/features/practice/schema';
import { DESIGN_TOKENS } from '@/shared/design-tokens';

const at = (x: number, y: number) => ({ x, y });
const apply = (script: PracticeScript, edit: Parameters<typeof applyEdit>[1]): PracticeScript => {
  const result = applyEdit(script, edit);
  if (typeof result === 'string') throw new Error(result);
  return result;
};

describe('cone colours', () => {
  it('schema accepts each colour and rejects others', () => {
    for (const colour of CONE_COLOURS) expect(MarkerSchema.safeParse({ id: 'c1', kind: 'cone', colour }).success).toBe(true);
    expect(MarkerSchema.safeParse({ id: 'c1', kind: 'cone', colour: 'pink' }).success).toBe(false);
  });

  it('rejects a colour on a marker that is not a cone, with the field path', () => {
    const script = apply(emptyScript(), { type: 'addMarker', kind: 'attacker', at: at(3, 3) });
    const bad = { ...script, markers: [{ ...script.markers[0], colour: 'red' }] };
    const result = validate(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].path).toBe('markers[0].colour');
  });

  it('resolves each colour and defaults to yellow', () => {
    for (const colour of CONE_COLOURS) {
      expect(markerColour({ kind: 'cone', colour })).toBe(DESIGN_TOKENS.colours.cone[colour]);
    }
    expect(markerColour({ kind: 'cone' })).toBe(DESIGN_TOKENS.colours.cone.yellow);
    expect(markerColour({ kind: 'cone' })).toBe(DESIGN_TOKENS.colours.neutral[2]);
  });

  it('setColour colours a cone, yellow clears it, and other kinds are left alone', () => {
    let script = apply(emptyScript(), { type: 'addMarker', kind: 'cone', at: at(2, 2) });
    expect(script.markers[0].colour).toBeUndefined();
    script = apply(script, { type: 'setColour', marker: 'cone1', colour: 'red' });
    expect(script.markers[0].colour).toBe('red');
    expect(validate(script).ok).toBe(true);
    script = apply(script, { type: 'setColour', marker: 'cone1', colour: 'yellow' });
    expect('colour' in script.markers[0]).toBe(false);

    const withPlayer = apply(script, { type: 'addMarker', kind: 'attacker', at: at(4, 4) });
    expect(apply(withPlayer, { type: 'setColour', marker: 'a1', colour: 'blue' })).toBe(withPlayer);
  });

  it('addMarker places a cone in the given colour', () => {
    const script = apply(emptyScript(), { type: 'addMarker', kind: 'cone', at: at(2, 2), colour: 'green' });
    expect(script.markers[0].colour).toBe('green');
    expect(apply(emptyScript(), { type: 'addMarker', kind: 'cone', at: at(2, 2), colour: 'yellow' }).markers[0].colour).toBeUndefined();
  });
});
