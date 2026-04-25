import { useState, useEffect, RefObject } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Container-measured canvas sizing hook for the editor viewer.
 *
 * Uses ResizeObserver on a container ref (not window.innerHeight) so it
 * responds to the actual DOM layout driven by `100dvh` CSS.
 *
 * The canvas is fitted inside the container while preserving the aspect ratio:
 * - If the container is wider than it is tall (relative to the ratio), constrain by height.
 * - Otherwise, constrain by width.
 */
export function useEditorCanvasSize(
  containerRef: RefObject<HTMLElement>,
  aspectRatio = 4 / 3,
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>(() => {
    if (typeof window === 'undefined') return { width: 800, height: 600 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const byWidth = { w: vw, h: vw / aspectRatio };
    const use = byWidth.h <= vh ? byWidth : { w: vh * aspectRatio, h: vh };
    return { width: Math.floor(use.w), height: Math.floor(use.h) };
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width: vw, height: vh } = entry.contentRect;
      if (vw <= 0 || vh <= 0) return;

      // Try fitting by width first; if that's too tall, fit by height instead
      const byWidth = { w: vw, h: vw / aspectRatio };
      const use = byWidth.h <= vh ? byWidth : { w: vh * aspectRatio, h: vh };

      setSize({ width: Math.floor(use.w), height: Math.floor(use.h) });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, aspectRatio]);

  return size;
}
