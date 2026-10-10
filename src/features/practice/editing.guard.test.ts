import { afterEach, describe, expect, it, vi } from 'vitest';
import { addProgression, applyStepEdit, emptyScript, type Edit } from '@/features/practice/editing';
import { validate } from '@/features/practice/engine';

// Let a test make the engine throw for scripts that still pass validation (#189).
const throwOn = vi.hoisted(() => ({ marker: undefined as string | undefined }));
vi.mock('@/features/practice/engine', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/features/practice/engine')>();
  return {
    ...real,
    positionsAt: (step: Parameters<typeof real.positionsAt>[0], t: number) => {
      if (throwOn.marker && step.markers.some((m) => m.id === throwOn.marker)) throw new Error('Maximum call stack size exceeded');
      return real.positionsAt(step, t);
    },
  };
});

const at = (x: number, y: number) => ({ x, y });
const add = (x: number, y: number): Edit => ({ type: 'addMarker', kind: 'attacker', at: at(x, y) });

function ok<T>(result: T | string): T {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

afterEach(() => {
  throwOn.marker = undefined;
});

describe('keepValid engine guard', () => {
  it('lets a valid edit through when the engine copes', () => {
    expect(typeof applyStepEdit(emptyScript(), 0, add(2, 2))).toBe('object');
  });

  it('refuses an edit that validates but makes the engine throw', () => {
    const start = ok(applyStepEdit(emptyScript(), 0, add(2, 2)));
    throwOn.marker = 'a2';
    const result = applyStepEdit(start, 0, add(5, 5));
    expect(result).toMatch(/^.+: Step 1 can’t be animated with that change/);
  });

  it('names the Step that breaks', () => {
    const start = ok(applyStepEdit(addProgression(ok(applyStepEdit(emptyScript(), 0, add(2, 2)))), 0, add(3, 3)));
    expect(validate(start).ok).toBe(true);
    throwOn.marker = 'a3';
    // Adding a3 in Step 2 only: Step 1 is fine, Step 2 throws.
    const result = applyStepEdit(start, 1, add(6, 6));
    expect(result).toMatch(/Step 2 can’t be animated/);
  });
});
