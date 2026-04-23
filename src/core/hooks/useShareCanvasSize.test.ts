// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShareCanvasSize } from './useShareCanvasSize';

describe('useShareCanvasSize', () => {
  beforeEach(() => {
    global.ResizeObserver = class {
      observe = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
  });

  it('initializes to viewport-fitted size on first render — no 800×600 flash', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 844 });

    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useShareCanvasSize(containerRef));

    // iPhone 14 portrait: constrain by width (390/(4/3) = 292.5 → floor 292)
    // byWidth.h (292) <= vh (844), so fit by width
    expect(result.current.width).toBe(390);
    expect(result.current.height).toBe(292);
  });

  it('initializes height-constrained when landscape viewport is short', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 844 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 390 });

    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useShareCanvasSize(containerRef));

    // Landscape 844×390: byWidth.h = 844/(4/3) = 633 > vh 390 → constrain by height
    // w = Math.floor(390 * 4/3) = Math.floor(520) = 520, h = Math.floor(390) = 390
    expect(result.current.width).toBe(520);
    expect(result.current.height).toBe(390);
  });
});
