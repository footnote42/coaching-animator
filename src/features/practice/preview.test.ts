import { describe, it, expect } from 'vitest';
import { PREVIEW_HOLD_S, previewTime } from './preview';

describe('previewTime', () => {
  it('plays in step with elapsed time', () => {
    expect(previewTime(0, 4)).toBe(0);
    expect(previewTime(2.5, 4)).toBe(2.5);
  });

  it('holds the final frame, then loops', () => {
    expect(previewTime(4 + PREVIEW_HOLD_S / 2, 4)).toBe(4);
    expect(previewTime(4 + PREVIEW_HOLD_S + 1, 4)).toBe(1);
  });

  it('stays at the start for a Step with no movement or a bad clock', () => {
    expect(previewTime(3, 0)).toBe(0);
    expect(previewTime(-1, 4)).toBe(0);
    expect(previewTime(NaN, 4)).toBe(0);
  });
});
