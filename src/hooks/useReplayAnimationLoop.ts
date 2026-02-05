import { useEffect, useRef } from 'react';
import { Frame, PlaybackPosition } from '../types';

/**
 * Options for the replay animation loop hook.
 */
export interface UseReplayAnimationLoopOptions {
  /** All frames in the animation */
  frames: Frame[];
  /** Current frame index (controlled by parent) */
  currentFrameIndex: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Playback speed multiplier (0.5, 1, 2) */
  playbackSpeed: number;
  /** Whether to loop back to frame 0 after last frame */
  loopPlayback: boolean;
  /** Called when advancing to the next frame */
  onFrameAdvance: (nextIndex: number) => void;
  /** Called when playback reaches the end (non-loop mode) */
  onPlaybackComplete: () => void;
  /** Called on every RAF tick with interpolation progress */
  onPlaybackPositionUpdate: (position: PlaybackPosition) => void;
}

/**
 * Store-free animation loop for the ReplayViewer.
 *
 * Modelled on src/hooks/useAnimationLoop.ts but without Zustand store dependency.
 * Uses refs for all mutable state to keep the RAF lifecycle stable —
 * only `isPlaying` triggers effect teardown/recreation.
 */
export function useReplayAnimationLoop({
  frames,
  currentFrameIndex,
  isPlaying,
  playbackSpeed,
  loopPlayback,
  onFrameAdvance,
  onPlaybackComplete,
  onPlaybackPositionUpdate,
}: UseReplayAnimationLoopOptions): void {
  // Refs for values that change during playback but shouldn't restart the RAF loop
  const framesRef = useRef(frames);
  const frameIndexRef = useRef(currentFrameIndex);
  const speedRef = useRef(playbackSpeed);
  const loopRef = useRef(loopPlayback);
  const onFrameAdvanceRef = useRef(onFrameAdvance);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);
  const onPlaybackPositionUpdateRef = useRef(onPlaybackPositionUpdate);

  // RAF tracking
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  // Sync refs on every render (cheap, no effect teardown)
  framesRef.current = frames;
  frameIndexRef.current = currentFrameIndex;
  speedRef.current = playbackSpeed;
  loopRef.current = loopPlayback;
  onFrameAdvanceRef.current = onFrameAdvance;
  onPlaybackCompleteRef.current = onPlaybackComplete;
  onPlaybackPositionUpdateRef.current = onPlaybackPositionUpdate;

  // Reset elapsed time when frame index changes (user clicked a frame, or loop wrapped)
  useEffect(() => {
    elapsedRef.current = 0;
    startTimeRef.current = null;
  }, [currentFrameIndex]);

  // Main RAF loop — only depends on isPlaying
  useEffect(() => {
    if (!isPlaying) {
      startTimeRef.current = null;
      elapsedRef.current = 0;
      return;
    }

    const animate = (timestamp: number) => {
      // Initialize start time on first tick
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = timestamp - startTimeRef.current;
      startTimeRef.current = timestamp;

      // Apply speed multiplier
      elapsedRef.current += deltaTime * speedRef.current;

      const currentFrames = framesRef.current;
      const idx = frameIndexRef.current;
      const currentFrame = currentFrames[idx];

      if (!currentFrame) {
        onPlaybackCompleteRef.current();
        return;
      }

      const progress = elapsedRef.current / currentFrame.duration;

      if (progress >= 1.0) {
        // Frame transition complete
        elapsedRef.current = 0;

        const isLastFrame = idx >= currentFrames.length - 1;

        if (isLastFrame) {
          if (loopRef.current) {
            onFrameAdvanceRef.current(0);
          } else {
            onPlaybackCompleteRef.current();
            return;
          }
        } else {
          onFrameAdvanceRef.current(idx + 1);
        }
      } else {
        // Mid-frame: update interpolation position
        const nextIdx = idx + 1 >= currentFrames.length
          ? (loopRef.current ? 0 : idx)
          : idx + 1;

        onPlaybackPositionUpdateRef.current({
          fromFrameIndex: idx,
          toFrameIndex: nextIdx,
          progress,
        });
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying]);
}
