'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { BrandIcon } from '@/shared/components/BrandIcon';
import type { Frame, SportType, PitchLayout, PlaybackPosition } from '@/core/types';
import { Stage } from '@/features/animation/components/Canvas/Stage';
import { Field } from '@/features/animation/components/Canvas/Field';
import { EntityLayer } from '@/features/animation/components/Canvas/EntityLayer';
import { AnnotationLayer } from '@/features/animation/components/Canvas/AnnotationLayer';
import { FloatingRemote } from '@/features/animation/components/Canvas/FloatingRemote';
import { useReplayAnimationLoop } from '@/core/hooks/useReplayAnimationLoop';
import { useShareCanvasSize } from '@/core/hooks/useShareCanvasSize';
import { hydrateSharePayload } from '@/core/utils/hydratePayload';
import type { SharePayloadV1 } from '@/core/types/share';
import { EDITOR_CANVAS_WIDTH, EDITOR_CANVAS_HEIGHT } from '@/lib/canvasConstants';

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

interface ShareViewerProps {
  payload: unknown;
  autoPlay?: boolean;
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
      className="bg-white overflow-hidden"
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
      </Stage>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShareViewer — full-screen, no scroll, FloatingRemote overlay
// ---------------------------------------------------------------------------

export function ShareViewer({ payload: rawPayload, autoPlay = true }: ShareViewerProps) {
  const payload = useMemo(() => normalizeReplayPayload(rawPayload), [rawPayload]);
  const frames = payload.frames;

  const containerRef = useRef<HTMLDivElement>(null);
  const { width: canvasWidth, height: canvasHeight } = useShareCanvasSize(containerRef);
  const entityScaleX = canvasWidth / EDITOR_CANVAS_WIDTH;
  const entityScaleY = canvasHeight / EDITOR_CANVAS_HEIGHT;

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
      </div>

      {/* Back-to-site link — bottom-left, away from remote's default bottom-right */}
      <a
        href="/"
        className="absolute left-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
      >
        <BrandIcon 
          variant="share-viewer" 
          className="brightness-0 invert opacity-60"
        />
        <span className="hidden sm:inline">Coaching Animator</span>
      </a>
    </div>
  );
}
