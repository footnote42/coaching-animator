'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import type { Frame, SportType, PitchLayout, PlaybackPosition } from '@/types';
import { Stage } from '@/components/Canvas/Stage';
import { Field } from '@/components/Canvas/Field';
import { EntityLayer } from '@/components/Canvas/EntityLayer';
import { AnnotationLayer } from '@/components/Canvas/AnnotationLayer';
import { useReplayAnimationLoop } from '@/hooks/useReplayAnimationLoop';
import { hydrateSharePayload } from '@/utils/hydratePayload';
import type { SharePayloadV1 } from '@/types/share';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReplayPayload {
  version: string;
  name: string;
  sport: SportType;
  frames: Frame[];
  settings: { pitchLayout?: PitchLayout;[key: string]: unknown };
}

interface ReplayViewerProps {
  payload: unknown;
}

// ---------------------------------------------------------------------------
// Payload normalisation (single source of backward-compat fixes)
// ---------------------------------------------------------------------------

const VALID_SPORTS: readonly string[] = [
  'rugby-union',
  'rugby-league',
  'soccer',
  'american-football',
];

/**
 * Normalise a raw database payload into a typed ReplayPayload.
 */
function normalizeReplayPayload(raw: unknown): ReplayPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload = (raw ?? {}) as Record<string, any>;

  // DETECT V1/V2 SHARE PAYLOAD
  // SharePayloadV1 uses 'frames[].updates' instead of 'frames[].entities'
  const isSharePayload = Array.isArray(payload.frames) &&
    payload.frames.length > 0 &&
    payload.frames[0].updates !== undefined;

  if (isSharePayload) {
    console.log('[ReplayViewer] Detected SharePayload, hydrating...');
    try {
      const project = hydrateSharePayload(payload as SharePayloadV1);
      // Transform hydrated project back into ReplayPayload shape
      // ReplayPayload is essentially Project properties
      return {
        version: project.version,
        name: project.name,
        sport: project.sport,
        frames: project.frames,
        settings: { ...project.settings }
      };
    } catch (err) {
      console.error('[ReplayViewer] Hydration failed:', err);
      // Fallthrough to standard normalization (which will likely result in empty/broken but safe render)
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
// Canvas dimensions
// ---------------------------------------------------------------------------

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// ---------------------------------------------------------------------------
// ReplayCanvas — owns playbackPosition, isolates 60fps re-renders
// ---------------------------------------------------------------------------

interface ReplayCanvasProps {
  frames: Frame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  loopPlayback: boolean;
  sport: SportType;
  pitchLayout?: PitchLayout;
  onFrameAdvance: (nextIndex: number) => void;
  onPlaybackComplete: () => void;
}

function ReplayCanvas({
  frames,
  currentFrameIndex,
  isPlaying,
  playbackSpeed,
  loopPlayback,
  sport,
  pitchLayout,
  onFrameAdvance,
  onPlaybackComplete,
}: ReplayCanvasProps) {
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackPosition | null>(null);

  useReplayAnimationLoop({
    frames,
    currentFrameIndex,
    isPlaying,
    playbackSpeed,
    loopPlayback,
    onFrameAdvance,
    onPlaybackComplete,
    onPlaybackPositionUpdate: setPlaybackPosition,
  });

  const currentFrame = frames[currentFrameIndex];
  const entities = currentFrame ? Object.values(currentFrame.entities) : [];
  const frameIds = useMemo(() => frames.map((f) => f.id), [frames]);

  return (
    <div className="w-full max-w-[800px] aspect-[4/3] border border-border bg-white overflow-hidden">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Field
          sport={sport}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          layout={pitchLayout}
        />
        <AnnotationLayer
          annotations={currentFrame?.annotations ?? []}
          selectedAnnotationId={null}
          onAnnotationSelect={() => { }}
          onContextMenu={() => { }}
          interactive={false}
          currentFrameId={currentFrame?.id ?? ''}
          frameIds={frameIds}
        />
        <EntityLayer
          entities={entities}
          selectedEntityId={null}
          onEntitySelect={() => { }}
          onEntityMove={() => { }}
          onEntityDoubleClick={() => { }}
          onEntityContextMenu={() => { }}
          interactive={false}
          playbackPosition={playbackPosition}
          frames={frames}
        />
      </Stage>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReplayViewer — orchestrator (low-frequency re-renders)
// ---------------------------------------------------------------------------

export function ReplayViewer({ payload: rawPayload }: ReplayViewerProps) {
  const payload = useMemo(() => normalizeReplayPayload(rawPayload), [rawPayload]);
  const frames = payload.frames;

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loopPlayback, setLoopPlayback] = useState(false);

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => {
      if (prev >= frames.length - 1) {
        if (loopPlayback) return 0;
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length, loopPlayback]);

  const prevFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentFrameIndex, frames.length]);

  if (!frames.length) {
    return (
      <div className="text-center py-20 text-text-primary/70">
        No frames to display
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Canvas — 60fps re-renders isolated here */}
      <ReplayCanvas
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        loopPlayback={loopPlayback}
        sport={payload.sport}
        pitchLayout={payload.settings?.pitchLayout}
        onFrameAdvance={setCurrentFrameIndex}
        onPlaybackComplete={() => setIsPlaying(false)}
      />

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={reset}
          className="p-2 border border-border hover:bg-surface-warm transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={prevFrame}
          disabled={currentFrameIndex === 0}
          className="p-2 border border-border hover:bg-surface-warm transition-colors disabled:opacity-50"
          title="Previous frame"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="p-3 bg-primary text-text-inverse hover:bg-primary/90 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={nextFrame}
          disabled={currentFrameIndex >= frames.length - 1 && !loopPlayback}
          className="p-2 border border-border hover:bg-surface-warm transition-colors disabled:opacity-50"
          title="Next frame"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <span className="text-sm text-text-primary/70 ml-2">
          Frame {currentFrameIndex + 1} / {frames.length}
        </span>

        {/* Speed controls */}
        <div className="flex items-center gap-1 ml-4">
          {[0.5, 1, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 text-xs border transition-colors ${playbackSpeed === speed
                ? 'bg-primary text-text-inverse border-primary'
                : 'border-border hover:border-primary'
                }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Loop toggle */}
        <button
          onClick={() => setLoopPlayback((prev) => !prev)}
          className={`p-2 border transition-colors ${loopPlayback
            ? 'bg-primary text-text-inverse border-primary'
            : 'border-border hover:bg-surface-warm'
            }`}
          title={loopPlayback ? 'Loop: On' : 'Loop: Off'}
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Frame strip */}
      <div className="mt-4 flex gap-1 overflow-x-auto pb-2 max-w-full">
        {frames.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentFrameIndex(index);
              setIsPlaying(false);
            }}
            className={`w-8 h-8 flex-shrink-0 border transition-colors ${index === currentFrameIndex
              ? 'bg-primary text-text-inverse border-primary'
              : 'bg-surface border-border hover:border-primary'
              }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
