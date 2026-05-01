'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GripVertical, ChevronLeft, ChevronRight, Play, Pause, ChevronDown, ChevronUp, Plus, RotateCcw, Ghost } from 'lucide-react';
import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import { PlaybackSpeed } from '@/core/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILL_WIDTH = 176;
const PILL_HEIGHT = 44;
const STORAGE_KEY = 'editor-remote-pos';
const EXPANDED_KEY = 'editor-remote-expanded';


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
  const addFrame = useProjectStore.getState().addFrame;
  const setPlaybackSpeed = useProjectStore.getState().setPlaybackSpeed;
  const toggleLoop = useProjectStore.getState().toggleLoop;
  const playbackSpeed = useProjectStore(s => s.playbackSpeed);
  const loopPlayback = useProjectStore(s => s.loopPlayback);

  const showGhosts = useUIStore(s => s.showGhosts);
  const toggleGhosts = useUIStore.getState().toggleGhosts;

  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(EXPANDED_KEY) === 'true';
  });

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => {
      const next = !prev;
      localStorage.setItem(EXPANDED_KEY, String(next));
      return next;
    });
  }, []);

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
          Math.min(prev.y, window.innerHeight - (PILL_HEIGHT * (expanded ? 2 : 1)) - safeAreaBottom.current),
        ),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expanded]);

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
    const maxY = window.innerHeight - (PILL_HEIGHT * (expanded ? 2 : 1)) - safeAreaBottom.current;
    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [expanded]);

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
      id="floating-remote"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: PILL_WIDTH,
        height: PILL_HEIGHT * (expanded ? 2 : 1),
        zIndex: 80,
        touchAction: 'none',
        userSelect: 'none',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
        transition: 'height 0.2s ease-out',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={() => handlePointerUp(pos)}
      onPointerCancel={() => { dragging.current = false; }}
      className="flex flex-col rounded-none bg-black/80 backdrop-blur-md border border-white/10 overflow-hidden"
    >
      <div className="flex items-center w-full h-[44px] flex-shrink-0">
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
          className="w-9 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous frame"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* PLAY / PAUSE */}
        <button
          onClick={isPlaying ? pause : play}
          className="w-10 h-11 flex items-center justify-center text-white"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* NEXT FRAME */}
        <button
          onClick={() => setCurrentFrame(currentFrameIndex + 1)}
          disabled={currentFrameIndex >= totalFrames - 1}
          className="w-9 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next frame"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* FRAME COUNTER */}
        <span className="text-[10px] text-white/70 font-mono tabular-nums px-1 min-w-[2.5rem] text-center">
          {currentFrameIndex + 1}/{totalFrames}
        </span>

        {/* EXPAND TOGGLE */}
        <button
          onClick={toggleExpanded}
          className="w-9 h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label={expanded ? 'Collapse remote' : 'Expand remote'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* SECOND ROW */}
      <div className="flex items-center w-full h-[44px] border-t border-white/5 px-1 gap-1 flex-shrink-0">
        <button
          onClick={addFrame}
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-all"
          aria-label="Add frame"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex bg-white/5 rounded-sm p-0.5">
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s as PlaybackSpeed)}
              className={`text-[9px] px-1.5 py-1 rounded-sm transition-all ${
                playbackSpeed === s ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <button
          onClick={toggleLoop}
          className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all ${
            loopPlayback ? 'text-primary' : 'text-white/40 hover:text-white/70 hover:bg-white/10'
          }`}
          aria-label={loopPlayback ? 'Disable loop' : 'Enable loop'}
        >
          <RotateCcw className={`w-4 h-4 ${loopPlayback ? 'animate-spin-slow' : ''}`} />
        </button>

        <button
          onClick={toggleGhosts}
          className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all ${
            showGhosts ? 'text-primary' : 'text-white/40 hover:text-white/70 hover:bg-white/10'
          }`}
          aria-label={showGhosts ? 'Disable ghost mode' : 'Enable ghost mode'}
        >
          <Ghost className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
