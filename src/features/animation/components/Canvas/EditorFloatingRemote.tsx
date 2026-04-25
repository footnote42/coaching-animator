'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { GripVertical, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useProjectStore } from '@/core/stores/projectStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILL_WIDTH = 176;
const PILL_HEIGHT = 44;
const STORAGE_KEY = 'editor-remote-pos';

// ---------------------------------------------------------------------------
// Safe area helper (copied verbatim from FloatingRemote.tsx)
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
// localStorage helpers
// ---------------------------------------------------------------------------

function loadStoredPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).x !== 'number' ||
      typeof (parsed as Record<string, unknown>).y !== 'number'
    ) {
      return null;
    }
    const { x, y } = parsed as { x: number; y: number };
    if (
      x < 0 ||
      x > window.innerWidth - PILL_WIDTH ||
      y < 0 ||
      y > window.innerHeight - PILL_HEIGHT
    ) {
      return null;
    }
    return { x, y };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// EditorFloatingRemote
// ---------------------------------------------------------------------------

/**
 * A `position: fixed` draggable playback remote for the editor.
 *
 * - No props — reads `useProjectStore` selectors internally.
 * - Manages its own position in state, synced to localStorage.
 * - Supplements (does not replace) the existing footer PlaybackControls.
 * - Sharp corners (`rounded-none`), hard-edged shadow — per Constitution §IV / UI-003.
 */
export function EditorFloatingRemote() {
  // Store selectors (cause re-render on change)
  const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);
  const isPlaying = useProjectStore(s => s.isPlaying);
  const project = useProjectStore(s => s.project);
  const totalFrames = project?.frames.length ?? 0;

  // Actions (via getState — no re-render on store updates)
  const play = useProjectStore.getState().play;
  const pause = useProjectStore.getState().pause;
  const setCurrentFrame = useProjectStore.getState().setCurrentFrame;

  // Safe area ref (populated after mount)
  const safeAreaBottom = useRef(0);

  // Position state — lazy initialiser so `window` is only accessed client-side
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const defaultPos = {
      x: typeof window !== 'undefined' ? window.innerWidth - PILL_WIDTH - 16 : 0,
      y:
        typeof window !== 'undefined'
          ? window.innerHeight - PILL_HEIGHT - 16
          : 0,
    };
    return defaultPos;
  });

  // Populate safe area and attempt to load stored position after mount
  useEffect(() => {
    safeAreaBottom.current = getSafeAreaBottom();
    const stored = loadStoredPosition();
    if (stored) {
      setPos(stored);
    } else {
      setPos({
        x: window.innerWidth - PILL_WIDTH - 16,
        y: window.innerHeight - PILL_HEIGHT - safeAreaBottom.current - 16,
      });
    }
  }, []);

  // Viewport resize — re-clamp position into new bounds (does NOT write to localStorage)
  useEffect(() => {
    const handleResize = () => {
      setPos(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - PILL_WIDTH)),
        y: Math.max(
          0,
          Math.min(prev.y, window.innerHeight - PILL_HEIGHT - safeAreaBottom.current),
        ),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------------------------------------------------------
  // Drag state
  // ---------------------------------------------------------------------------

  const dragging = useRef(false);
  const dragStart = useRef({ pointerX: 0, pointerY: 0, startX: 0, startY: 0 });

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos.x, pos.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.pointerX;
    const dy = e.clientY - dragStart.current.pointerY;
    const newX = dragStart.current.startX + dx;
    const newY = dragStart.current.startY + dy;
    const maxX = window.innerWidth - PILL_WIDTH;
    const maxY = window.innerHeight - PILL_HEIGHT - safeAreaBottom.current;
    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, []);

  const handlePointerUp = useCallback((currentPos: { x: number; y: number }) => {
    dragging.current = false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPos));
    } catch {
      // silent — private browsing or quota exceeded
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: PILL_WIDTH,
        height: PILL_HEIGHT,
        zIndex: 50,
        touchAction: 'none',
        userSelect: 'none',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={() => handlePointerUp(pos)}
      onPointerCancel={() => { dragging.current = false; }}
      className="flex items-center rounded-none bg-black/70 border border-white/10"
    >
      {/* DRAG HANDLE */}
      <div
        onPointerDown={handleDragStart}
        className="px-2 py-3 text-white/40 flex-shrink-0 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reposition"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* PREV FRAME */}
      <button
        onClick={() => setCurrentFrame(currentFrameIndex - 1)}
        disabled={currentFrameIndex === 0}
        className="w-11 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous frame"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* PLAY / PAUSE */}
      <button
        onClick={isPlaying ? pause : play}
        className="w-11 h-11 flex items-center justify-center text-white"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* NEXT FRAME */}
      <button
        onClick={() => setCurrentFrame(currentFrameIndex + 1)}
        disabled={currentFrameIndex >= totalFrames - 1}
        className="w-11 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next frame"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* FRAME COUNTER */}
      <span className="text-xs text-white/70 font-mono tabular-nums px-2 min-w-[3.5rem] text-center">
        {currentFrameIndex + 1} / {totalFrames}
      </span>
    </div>
  );
}
