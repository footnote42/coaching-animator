import { describe, it, expect } from 'vitest';
import { tackleBagShape } from '@/features/practice/tackleBag';

describe('tackleBagShape', () => {
  it('stands taller than a tackle shield (2 marker radii), centred on its point, with rounded ends', () => {
    const bag = tackleBagShape(50, 40, 10);
    expect(bag.height).toBeGreaterThan(20);
    expect(bag.height).toBeGreaterThan(bag.width);
    expect(bag.x + bag.width / 2).toBeCloseTo(50);
    expect(bag.y + bag.height / 2).toBeCloseTo(40);
    expect(bag.cornerRadius).toBeCloseTo(bag.width / 2);
  });

  it('lies flat as the upright bag turned 90 degrees', () => {
    const up = tackleBagShape(50, 40, 10);
    const flat = tackleBagShape(50, 40, 10, true);
    expect([flat.width, flat.height]).toEqual([up.height, up.width]);
    expect(flat.cornerRadius).toBeCloseTo(up.cornerRadius);
  });

  it('scales with the marker radius, and so with the Area', () => {
    const small = tackleBagShape(0, 0, 5);
    const big = tackleBagShape(0, 0, 10);
    expect(big.width).toBeCloseTo(small.width * 2);
    expect(big.height).toBeCloseTo(small.height * 2);
  });

  it('shades the right side when upright and the bottom side when Lying', () => {
    const numbers = (path: string) => path.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const xs = (path: string) => numbers(path.replace(/A [\d.]+ [\d.]+ 0 0 \d /g, 'A ')).filter((_, i) => i % 2 === 0);
    const ys = (path: string) => numbers(path.replace(/A [\d.]+ [\d.]+ 0 0 \d /g, 'A ')).filter((_, i) => i % 2 === 1);
    expect(Math.min(...xs(tackleBagShape(50, 40, 10).shade))).toBeGreaterThan(50);
    expect(Math.min(...ys(tackleBagShape(50, 40, 10, true).shade))).toBeGreaterThan(40);
  });
});
