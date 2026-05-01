import { describe, it, expect } from 'vitest';
import { snapPosition } from '@/features/animation/services/snapGrid';

describe('snapGrid service', () => {
  const stageWidth = 1600;
  const stageHeight = 1200;
  // cellW = 1600 / 16 = 100
  // cellH = 1200 / 12 = 100

  it('returns identity when snap is disabled', () => {
    const pos = { x: 55, y: 55 };
    expect(snapPosition(pos.x, pos.y, stageWidth, stageHeight, false)).toEqual(pos);
  });

  it('snaps to the nearest grid intersection', () => {
    // 55 should snap to 100, 44 should snap to 0
    expect(snapPosition(55, 44, stageWidth, stageHeight, true)).toEqual({ x: 100, y: 0 });
    // 151 should snap to 200, 249 should snap to 200
    expect(snapPosition(151, 249, stageWidth, stageHeight, true)).toEqual({ x: 200, y: 200 });
  });

  it('clamps to stage boundaries', () => {
    // Negative values
    expect(snapPosition(-10, -10, stageWidth, stageHeight, true)).toEqual({ x: 0, y: 0 });
    // Beyond stage width/height
    expect(snapPosition(stageWidth + 10, stageHeight + 10, stageWidth, stageHeight, true)).toEqual({
      x: stageWidth,
      y: stageHeight,
    });
  });

  it('handles equidistant tie-breaking (Math.round behavior)', () => {
    // 50 is exactly half-way between 0 and 100. Math.round(50/100) = Math.round(0.5) = 1 -> 100
    expect(snapPosition(50, 50, stageWidth, stageHeight, true)).toEqual({ x: 100, y: 100 });
  });

  it('snaps to far edge correctly', () => {
    // Near 1600, 1200
    expect(snapPosition(stageWidth - 10, stageHeight - 10, stageWidth, stageHeight, true)).toEqual({
      x: stageWidth,
      y: stageHeight,
    });
  });
});
