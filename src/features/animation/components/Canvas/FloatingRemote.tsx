'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GripVertical, Play, Pause } from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILL_WIDTH = 120;
const PILL_HEIGHT = 44;
const DOUBLE_TAP_MS = 300;

// ---------------------------------------------------------------------------
// Safe area helper
// ---------------------------------------------------------------------------

/** Read env(safe-area-inset-bottom) via a hidden sentinel element. */
function getSafeAreaBottom(): number {
  if (typeof document === 'undefined') return 0;
  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;bottom:0;left:0;width:1px;height:0;padding-bottom:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden;';
  document.body.appendChild(el);
  const h = el.getBoundingClientRect().height;
  document.body.removeChild(el);
  return h;
}

// ---------------------------------------------------------------------------
// FloatingRemote props
// ---------------------------------------------------------------------------

interface FloatingRemoteProps {
  /** True while animation is playing */
  isPlaying: boolean;
  /** Current 0-based frame index */
  currentFrameIndex: number;
  /** Total frame count */
  totalFrames: number;
  /** Toggle play/pause */
  onTogglePlay: () => void;
  /** Reset to frame 0 and resume */
  onReset: () => void;
  /** Width of the container element (pixels) */
  containerWidth: number;
  /** Height of the container element (pixels) */
  containerHeight: number;
}

// ---------------------------------------------------------------------------
// FloatingRemote
// ---------------------------------------------------------------------------

/**
 * A small draggable pill overlay with play/pause and frame counter.
 *
 * Design decisions (do not re-litigate):
 * - Drag handle only: the GripVertical icon is the sole drag trigger.
 * - Play button and frame counter have independent click/tap handlers.
 * - Position stored as percentage (xPct, yPct) so orientation changes don't orphan the pill.
 * - Double-tap play button (within 300ms) resets to frame 1 and resumes — no separate reset icon.
 * - maxY clamped by safe-area-inset-bottom to clear iPhone home indicator.
 */
export function FloatingRemote({
  isPlaying,
  currentFrameIndex,
  totalFrames,
  onTogglePlay,
  onReset,
  containerWidth,
  containerHeight,
}: FloatingRemoteProps) {
  // Position as percentage of container (default: bottom-right)
  const [pos, setPos] = useState({ xPct: 0.85, yPct: 0.85 });

  // Derive absolute pixels
  const absX = Math.max(0, Math.min(pos.xPct * containerWidth - PILL_WIDTH, containerWidth - PILL_WIDTH));
  const absY = Math.max(0, Math.min(pos.yPct * containerHeight - PILL_HEIGHT, containerHeight - PILL_HEIGHT));

  // Drag state
  const dragging = useRef(false);
  const dragStart = useRef({ pointerX: 0, pointerY: 0, absX: 0, absY: 0 });
  const safeAreaBottom = useRef(0);

  useEffect(() => {
    safeAreaBottom.current = getSafeAreaBottom();
  }, []);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      dragStart.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        absX,
        absY,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [absX, absY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.pointerX;
      const dy = e.clientY - dragStart.current.pointerY;
      const newAbsX = dragStart.current.absX + dx;
      const newAbsY = dragStart.current.absY + dy;

      const minY = 0;
      const maxY = containerHeight - PILL_HEIGHT - safeAreaBottom.current;

      const clampedX = Math.max(0, Math.min(newAbsX, containerWidth - PILL_WIDTH));
      const clampedY = Math.max(minY, Math.min(newAbsY, maxY));

      setPos({
        xPct: (clampedX + PILL_WIDTH) / containerWidth,
        yPct: (clampedY + PILL_HEIGHT) / containerHeight,
      });
    },
    [containerWidth, containerHeight],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Double-tap detection for reset
  const lastTap = useRef<number>(0);

  const handlePlayTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      // Double-tap: reset
      lastTap.current = 0;
      onReset();
    } else {
      lastTap.current = now;
      onTogglePlay();
    }
  }, [onTogglePlay, onReset]);

  return (
    <div
      style={{
        position: 'absolute',
        left: absX,
        top: absY,
        width: PILL_WIDTH,
        height: PILL_HEIGHT,
        touchAction: 'none',
        userSelect: 'none',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="flex items-center rounded-full bg-black/80 border border-white/10"
    >
      {/* intentional: share-view playback pill — rounded-full is the brand shape for mobile replay */}
      {/* DRAG HANDLE — only this element triggers drag */}
      <div
        onPointerDown={handleDragStart}
        className="cursor-grab active:cursor-grabbing px-2 py-3 text-white/40 flex-shrink-0"
        aria-label="Drag to reposition"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* PLAY/PAUSE — 44×44px touch target */}
      <button
        onClick={handlePlayTap}
        className="w-11 h-11 flex items-center justify-center text-white flex-shrink-0"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title="Double-tap to reset to start"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* FRAME COUNTER */}
      <span className="text-xs text-white/60 tabular-nums pr-3 flex-1 text-right">
        {currentFrameIndex + 1}/{totalFrames}
      </span>
    </div>
  );
}

