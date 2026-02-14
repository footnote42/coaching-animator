import { useState, useEffect, useRef } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Hook to calculate responsive canvas dimensions while preserving aspect ratio.
 * Automatically adjusts to viewport size on mobile while capping at max dimensions on desktop.
 *
 * @param maxWidth - Maximum canvas width (default: 800px)
 * @param aspectRatio - Width-to-height ratio (default: 4/3 for pitch consistency)
 * @param minWidth - Minimum canvas width to prevent nonsense values (default: 280px)
 * @returns Object containing responsive width and height
 *
 * @example
 * ```tsx
 * const { width, height } = useCanvasSize(800, 4/3);
 * <Stage width={width} height={height}>
 * ```
 */
export function useCanvasSize(
  maxWidth: number = 800,
  aspectRatio: number = 4 / 3,
  minWidth: number = 280
): CanvasSize {
  // SSR-safe initial state (prevents hydration mismatch - Issue #1)
  const [size, setSize] = useState<CanvasSize>({
    width: maxWidth,
    height: maxWidth / aspectRatio,
  });

  const rafIdRef = useRef<number>();

  useEffect(() => {
    function calculateSize(): CanvasSize {
      const padding = 32; // 16px each side

      // FIXED: Prevent negative width on tiny screens (Issue #2)
      const constrainedWidth = Math.max(
        minWidth,
        Math.min(window.innerWidth - padding, maxWidth)
      );

      return {
        width: constrainedWidth,
        height: constrainedWidth / aspectRatio,
      };
    }

    // FIXED: RAF debounce for iOS resize storms (Issue #3)
    function handleResize() {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        setSize(calculateSize());
      });
    }

    // Set initial size (client-side only)
    handleResize();

    // Listen for viewport changes
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [maxWidth, aspectRatio, minWidth]);

  return size;
}
