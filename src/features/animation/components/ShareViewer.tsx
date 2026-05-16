'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { BrandIcon } from '@/shared/components/BrandIcon';
import type { Frame, SportType, PitchLayout, PlaybackPosition } from '@/core/types';
import { Stage } from '@/features/animation/components/Canvas/Stage';
import { Field } from '@/features/animation/components/Canvas/Field';
import { EntityLayer } from '@/features/animation/components/Canvas/EntityLayer';
import { AnnotationLayer } from '@/features/animation/components/Canvas/AnnotationLayer';
import { PitchLegend } from '@/features/animation/components/Canvas/PitchLegend';
import { FloatingRemote } from '@/features/animation/components/Canvas/FloatingRemote';
import { useReplayAnimationLoop } from '@/core/hooks/useReplayAnimationLoop';
import { useShareCanvasSize } from '@/core/hooks/useShareCanvasSize';
import { hydrateSharePayload } from '@/core/utils/hydratePayload';
import { CoachingNotesOverlay } from '@/shared/components/CoachingNotesOverlay';
import { FileText } from 'lucide-react';
import type { SharePayloadV1 } from '@/core/types/share';
import { EDITOR_CANVAS_WIDTH, EDITOR_CANVAS_HEIGHT } from '@/lib/canvasConstants';
import { useUser } from '@/lib/contexts/UserContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReplayPayload {
  version: string;
  name: string;
  sport: SportType;
  frames: Frame[];
  settings: { pitchLayout?: PitchLayout; [key: string]: unknown };
}

interface NavigationItem {
  id: string;
  label: string;
}

interface ShareViewerProps {
  payload: unknown;
  autoPlay?: boolean;
  /** Server-provided title — takes precedence over payload.name */
  animationTitle?: string;
  /** Full ordered nav set including base + progressions */
  fullNavigationSet?: NavigationItem[];
  currentAnimationId?: string;
  /** The user ID of the animation owner */
  animationUserId?: string;
  /** Optional coaching notes */
  coachingNotes?: string | null;
}

// ---------------------------------------------------------------------------
// Payload normalisation (mirrors ReplayViewer)
// ---------------------------------------------------------------------------

const VALID_SPORTS: readonly string[] = [
  'rugby-union',
  'rugby-league',
  'soccer',
  'american-football',
];

function normalizeReplayPayload(raw: unknown): ReplayPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (raw ?? {}) as Record<string, any>;

  const isSharePayload =
    Array.isArray(payload.frames) &&
    payload.frames.length > 0 &&
    payload.frames[0].updates !== undefined;

  if (isSharePayload) {
    try {
      const project = hydrateSharePayload(payload as SharePayloadV1);
      return {
        version: project.version,
        name: project.name,
        sport: project.sport,
        frames: project.frames,
        settings: { ...project.settings },
      };
    } catch {
      // fallthrough
    }
  }

  const sport: SportType = VALID_SPORTS.includes(payload.sport as string)
    ? (payload.sport as SportType)
    : 'rugby-union';

  const rawFrames = Array.isArray(payload.frames) ? payload.frames : [];
  const frameIds: string[] = rawFrames.map((f: { id?: string }) => f.id ?? '');

  const normalizedFrames: Frame[] = rawFrames.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (frame: any) => ({
      ...frame,
      entities: Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.entries(frame.entities ?? {}).map(([id, entity]: [string, any]) => [
          id,
          {
            ...entity,
            x: Number.isFinite(entity.x) ? entity.x : 0,
            y: Number.isFinite(entity.y) ? entity.y : 0,
            zIndexOffset: entity.zIndexOffset || 0,
            parentId: entity.parentId || undefined,
            orientation: entity.orientation || undefined,
          },
        ]),
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      annotations: (frame.annotations ?? []).map((a: any) => ({
        ...a,
        startFrameId: a.startFrameId || frameIds[0] || frame.id,
        endFrameId: a.endFrameId || frameIds[frameIds.length - 1] || frame.id,
      })),
    }),
  );

  return {
    version: String(payload.version || '1.0.0'),
    name: String(payload.name || 'Untitled'),
    sport,
    frames: normalizedFrames,
    settings: (payload.settings as ReplayPayload['settings']) || {},
  };
}

// ---------------------------------------------------------------------------
// ShareCanvas — sized by container ref via useShareCanvasSize
// ---------------------------------------------------------------------------

interface ShareCanvasProps {
  frames: Frame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  sport: SportType;
  pitchLayout?: PitchLayout;
  canvasWidth: number;
  canvasHeight: number;
  entityScaleX: number;
  entityScaleY: number;
  onFrameAdvance: (nextIndex: number) => void;
  onPlaybackComplete: () => void;
}

function ShareCanvas({
  frames,
  currentFrameIndex,
  isPlaying,
  sport,
  pitchLayout,
  canvasWidth,
  canvasHeight,
  entityScaleX,
  entityScaleY,
  onFrameAdvance,
  onPlaybackComplete,
}: ShareCanvasProps) {
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackPosition | null>(null);

  useReplayAnimationLoop({
    frames,
    currentFrameIndex,
    isPlaying,
    playbackSpeed: 1,
    loopPlayback: true,
    onFrameAdvance,
    onPlaybackComplete,
    onPlaybackPositionUpdate: setPlaybackPosition,
  });

  const currentFrame = frames[currentFrameIndex];
  const entities = currentFrame ? Object.values(currentFrame.entities) : [];
  const frameIds = useMemo(() => frames.map((f) => f.id), [frames]);

  return (
    <div
      style={{ width: canvasWidth, height: canvasHeight }}
      className="bg-surface overflow-hidden"
      data-testid="share-canvas"
      data-entity-scale-x={entityScaleX}
      data-entity-scale-y={entityScaleY}
    >
      <Stage width={canvasWidth} height={canvasHeight}>
        <Field sport={sport} width={canvasWidth} height={canvasHeight} layout={pitchLayout} />
        <AnnotationLayer
          annotations={currentFrame?.annotations ?? []}
          selectedAnnotationId={null}
          onAnnotationSelect={() => {}}
          onContextMenu={() => {}}
          interactive={false}
          currentFrameId={currentFrame?.id ?? ''}
          frameIds={frameIds}
        />
        <EntityLayer
          entities={entities}
          selectedEntityId={null}
          onEntitySelect={() => {}}
          onEntityMove={() => {}}
          onEntityDoubleClick={() => {}}
          onEntityContextMenu={() => {}}
          interactive={false}
          playbackPosition={playbackPosition}
          frames={frames}
          scaleX={entityScaleX}
          scaleY={entityScaleY}
        />
        <PitchLegend height={canvasHeight} />
      </Stage>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShareViewer — full-screen, no scroll, FloatingRemote overlay
// ---------------------------------------------------------------------------

export function ShareViewer({
  payload: rawPayload,
  autoPlay = true,
  animationTitle,
  fullNavigationSet,
  currentAnimationId,
  animationUserId,
  coachingNotes,
}: ShareViewerProps) {
  const { user } = useUser();
  const isOwner = Boolean(user?.id && animationUserId && user.id === animationUserId);
  const payload = useMemo(() => normalizeReplayPayload(rawPayload), [rawPayload]);
  const frames = payload.frames;

  const containerRef = useRef<HTMLDivElement>(null);
  const { width: canvasWidth, height: canvasHeight } = useShareCanvasSize(containerRef);
  const entityScaleX = canvasWidth / EDITOR_CANVAS_WIDTH;
  const entityScaleY = canvasHeight / EDITOR_CANVAS_HEIGHT;

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  useEffect(() => {
    if (autoPlay && frames.length > 0) {
      const t = setTimeout(() => setIsPlaying(true), 100);
      return () => clearTimeout(t);
    }
  }, [autoPlay, frames.length]);

  const reset = useCallback(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentFrameIndex, frames.length]);

  if (!frames.length) {
    return (
      <div
        className="flex items-center justify-center text-white/70"
        style={{ position: 'fixed', inset: 0 }}
      >
        No frames to display
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden flex items-center justify-center bg-black"
      style={{ position: 'fixed', inset: 0 }}
    >
      {/* Canvas + FloatingRemote share a relative wrapper sized to the canvas,
          so the remote's absolute position anchors to the canvas, not the viewport */}
      <div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>
        {/* Animation title — top-center gradient overlay (T005) */}
        <div
          className="absolute top-0 left-0 right-0 px-4 py-2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none flex justify-between items-start gap-2"
          style={{ zIndex: 10 }}
        >
          <h1 className="text-white font-heading font-bold text-sm sm:text-base truncate text-left mt-1 pointer-events-auto">
            {animationTitle ?? payload.name}
          </h1>
          {coachingNotes && (
            <button
              onClick={() => setIsNotesOpen(true)}
              className="pointer-events-auto shrink-0 flex items-center gap-1.5 px-2 py-1 bg-black/60 hover:bg-black/80 rounded-none text-white/90 text-xs font-medium transition-colors border border-white/10"
              aria-label="View Coaching Notes"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notes</span>
            </button>
          )}
        </div>

        <ShareCanvas
          frames={frames}
          currentFrameIndex={currentFrameIndex}
          isPlaying={isPlaying}
          sport={payload.sport}
          pitchLayout={payload.settings?.pitchLayout}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          entityScaleX={entityScaleX}
          entityScaleY={entityScaleY}
          onFrameAdvance={setCurrentFrameIndex}
          onPlaybackComplete={() => setIsPlaying(false)}
        />

        <FloatingRemote
          isPlaying={isPlaying}
          currentFrameIndex={currentFrameIndex}
          totalFrames={frames.length}
          onTogglePlay={togglePlay}
          onReset={reset}
          containerWidth={canvasWidth}
          containerHeight={canvasHeight}
        />

        <CoachingNotesOverlay
          coachingNotes={coachingNotes || null}
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
        />

        {/* Progression navigation bar — bottom-center (T007) */}
        {fullNavigationSet && fullNavigationSet.length > 1 && (() => {
          const currentIndex = fullNavigationSet.findIndex((n) => n.id === currentAnimationId);
          const prevItem = currentIndex > 0 ? fullNavigationSet[currentIndex - 1] : null;
          const nextItem = currentIndex < fullNavigationSet.length - 1 ? fullNavigationSet[currentIndex + 1] : null;
          return (
            <div
              className="absolute left-0 right-0 flex justify-center items-center gap-3 px-4"
              style={{ zIndex: 20, bottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }}
            >
              {prevItem ? (
                <a
                  href={`/share/${prevItem.id}`}
                  className="px-3 py-1 bg-black/60 text-white/80 text-xs font-mono hover:bg-black/80 transition-colors"
                  aria-label={`Previous: ${prevItem.label}`}
                >
                  &#8592; Prev
                </a>
              ) : (
                <span className="px-3 py-1 text-xs font-mono text-transparent select-none">&#8592; Prev</span>
              )}
              <span className="px-3 py-1 bg-black/80 text-white text-xs font-mono">
                {currentIndex + 1} / {fullNavigationSet.length}
              </span>
              {nextItem ? (
                <a
                  href={`/share/${nextItem.id}`}
                  className="px-3 py-1 bg-black/60 text-white/80 text-xs font-mono hover:bg-black/80 transition-colors"
                  aria-label={`Next: ${nextItem.label}`}
                >
                  Next &#8594;
                </a>
              ) : (
                <span className="px-3 py-1 text-xs font-mono text-transparent select-none">Next &#8594;</span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Back-to-site link — bottom-left, away from remote's default bottom-right */}
      <a
        href={isOwner ? '/my-gallery' : '/gallery'}
        className="absolute left-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))', zIndex: 10 }}
      >
        <BrandIcon
          variant="share-viewer"
          className="brightness-0 invert opacity-60"
        />
        <span className="hidden sm:inline">← {isOwner ? 'My Playbook' : 'Gallery'}</span>
      </a>

      {/* Powered by link — bottom-right */}
      <a
        href="/"
        className="absolute right-3 text-[10px] text-white/30 hover:text-white/60 transition-colors"
        style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))', zIndex: 10 }}
      >
        powered by Coaching Animator
      </a>
    </div>
  );
}
