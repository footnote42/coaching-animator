// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasSize } from './useCanvasSize';

describe('useCanvasSize', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    // Store original window.innerWidth
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    // Restore original window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  /**
   * Helper function to mock window.innerWidth for testing
   */
  const setViewportWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  // ============================================
  // Required Tests (4)
  // ============================================

  it('returns max dimensions (800×600) when viewport exceeds max width', () => {
    setViewportWidth(1920);
    const { result } = renderHook(() => useCanvasSize());

    // At 1920px viewport: Math.min(1920 - 32, 800) = 800
    expect(result.current.width).toBe(800);
    // Height: 800 / (4/3) = 600
    expect(result.current.height).toBe(600);
  });

  it('scales down to fit viewport at 400px (368×276)', async () => {
    setViewportWidth(400);
    const { result } = renderHook(() => useCanvasSize());

    // Wait for useEffect to run and calculate size
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // At 400px viewport: Math.min(400 - 32, 800) = 368
    expect(result.current.width).toBe(368);
    // Height: 368 / (4/3) = 276
    expect(result.current.height).toBe(276);
  });

  it('maintains 4:3 aspect ratio at various viewport sizes', async () => {
    const testSizes = [375, 500, 768, 1024];

    for (const viewportWidth of testSizes) {
      setViewportWidth(viewportWidth);
      const { result } = renderHook(() => useCanvasSize());

      // Wait for useEffect to run and calculate size
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });

      const expectedWidth = Math.min(viewportWidth - 32, 800);
      const expectedHeight = expectedWidth / (4 / 3);

      expect(result.current.width).toBe(expectedWidth);
      expect(result.current.height).toBe(expectedHeight);

      // Verify 4:3 ratio (width / height = 4/3 = 1.333...)
      const ratio = result.current.width / result.current.height;
      expect(ratio).toBeCloseTo(4 / 3, 5); // 5 decimal places precision
    }
  });

  it('updates dimensions when window resizes', async () => {
    setViewportWidth(1920);
    const { result } = renderHook(() => useCanvasSize());

    // Initial state at desktop width
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);

    // Trigger resize to mobile width
    act(() => {
      setViewportWidth(375);
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for RAF debounce to complete
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // Verify updated dimensions at mobile width
    expect(result.current.width).toBe(343); // 375 - 32
    expect(result.current.height).toBe(257.25); // 343 / (4/3)
  });

  // ============================================
  // Edge Case Tests (3)
  // ============================================

  it('enforces minimum width of 280px on tiny viewports', async () => {
    setViewportWidth(100);
    const { result } = renderHook(() => useCanvasSize());

    // Wait for useEffect to run and calculate size
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // At 100px viewport: Math.max(280, Math.min(100 - 32, 800)) = 280
    expect(result.current.width).toBe(280);
    // Height: 280 / (4/3) = 210
    expect(result.current.height).toBe(210);
  });

  it('respects custom maxWidth, aspectRatio, and minWidth parameters', () => {
    // Test with 16:9 aspect ratio, max 1000px, min 320px
    setViewportWidth(1200);
    const { result: result1 } = renderHook(() =>
      useCanvasSize(1000, 16 / 9, 320)
    );

    // At 1200px viewport: Math.min(1200 - 32, 1000) = 1000
    expect(result1.current.width).toBe(1000);
    // Height: 1000 / (16/9) = 562.5
    expect(result1.current.height).toBe(562.5);

    // Test with 1:1 aspect ratio, max 600px, min 200px
    setViewportWidth(700);
    const { result: result2 } = renderHook(() => useCanvasSize(600, 1, 200));

    // At 700px viewport: Math.min(700 - 32, 600) = 600
    expect(result2.current.width).toBe(600);
    // Height: 600 / 1 = 600 (square)
    expect(result2.current.height).toBe(600);
  });

  it('removes event listener on unmount to prevent memory leaks', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    setViewportWidth(800);
    const { unmount } = renderHook(() => useCanvasSize());

    // Unmount the hook
    unmount();

    // Verify cleanup was called with 'resize'
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  // ============================================
  // Additional Reliability Tests
  // ============================================

  it('cancels pending RAF on unmount to prevent memory leaks', async () => {
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    setViewportWidth(1920);
    const { unmount } = renderHook(() => useCanvasSize());

    // Trigger resize but don't wait for RAF to complete
    act(() => {
      setViewportWidth(375);
      window.dispatchEvent(new Event('resize'));
    });

    // Unmount immediately (before RAF completes)
    unmount();

    // Verify cancelAnimationFrame was called during cleanup
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();

    cancelAnimationFrameSpy.mockRestore();
  });

  it('handles rapid resize events with RAF debouncing', async () => {
    setViewportWidth(1920);
    const { result } = renderHook(() => useCanvasSize());

    // Initial state
    expect(result.current.width).toBe(800);

    // Simulate rapid resize events (e.g., user dragging browser window)
    act(() => {
      setViewportWidth(1000);
      window.dispatchEvent(new Event('resize'));

      setViewportWidth(800);
      window.dispatchEvent(new Event('resize'));

      setViewportWidth(600);
      window.dispatchEvent(new Event('resize'));

      setViewportWidth(400);
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for RAF debounce to complete
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // Verify final state (only last resize should take effect)
    expect(result.current.width).toBe(368); // 400 - 32
    expect(result.current.height).toBe(276);
  });

  it('maintains consistency when dependencies change', async () => {
    setViewportWidth(1200);

    // Start with default parameters (800 max, 4:3 ratio)
    const { result, rerender } = renderHook(
      ({ maxWidth, aspectRatio, minWidth }) =>
        useCanvasSize(maxWidth, aspectRatio, minWidth),
      {
        initialProps: { maxWidth: 800, aspectRatio: 4 / 3, minWidth: 280 },
      }
    );

    // Wait for initial useEffect
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // Initial: At 1200px viewport with 800 max: 800x600
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);

    // Change parameters to 1000 max, 16:9 ratio
    rerender({ maxWidth: 1000, aspectRatio: 16 / 9, minWidth: 320 });

    // Wait for useEffect with new dependencies
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // After change: At 1200px viewport with 1000 max: 1000x562.5
    expect(result.current.width).toBe(1000);
    expect(result.current.height).toBe(562.5);
  });
});
