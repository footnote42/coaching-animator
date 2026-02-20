'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { Frame, SportType, PitchLayout, PlaybackPosition } from '@/core/types';
import { Stage } from '@/features/animation/components/Canvas/Stage';
import { Field } from '@/features/animation/components/Canvas/Field';
import { EntityLayer } from '@/features/animation/components/Canvas/EntityLayer';
import { AnnotationLayer } from '@/features/animation/components/Canvas/AnnotationLayer';
import { useReplayAnimationLoop } from '@/core/hooks/useReplayAnimationLoop';
import { useCanvasSize } from '@/core/hooks/useCanvasSize';
import { hydrateSharePayload } from '@/core/utils/hydratePayload';
import type { SharePayloadV1 } from '@/core/types/share';

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
// ShareCanvas — full-bleed canvas, no padding
// ---------------------------------------------------------------------------

interface ShareCanvasProps {
  frames: Frame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  sport: SportType;
  pitchLayout?: PitchLayout;
  onFrameAdvance: (nextIndex: number) => void;
  onPlaybackComplete: () => void;
}

function ShareCanvas({
  frames,
  currentFrameIndex,
  isPlaying,
  sport,
  pitchLayout,
  onFrameAdvance,
  onPlaybackComplete,
}: ShareCanvasProps) {
  const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4 / 3);
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
    <div style={{ width: canvasWidth }}>
      <div className="bg-white overflow-hidden">
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
          />
        </Stage>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShareViewer — stripped, watch-only viewer
// ---------------------------------------------------------------------------

export function ShareViewer({ payload: rawPayload, autoPlay = true }: ShareViewerProps) {
  const payload = useMemo(() => normalizeReplayPayload(rawPayload), [rawPayload]);
  const frames = payload.frames;

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
      <div className="text-center py-20 text-white/70">No frames to display</div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Canvas — full-bleed */}
      <ShareCanvas
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        isPlaying={isPlaying}
        sport={payload.sport}
        pitchLayout={payload.settings?.pitchLayout}
        onFrameAdvance={setCurrentFrameIndex}
        onPlaybackComplete={() => setIsPlaying(false)}
      />

      {/* Minimal controls */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={reset}
          className="w-12 h-12 border border-white/30 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          aria-label="Restart"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-white text-black hover:bg-white/90 transition-colors flex items-center justify-center"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <span className="text-sm text-white/60">
          {currentFrameIndex + 1} / {frames.length}
        </span>
      </div>
    </div>
  );
}
