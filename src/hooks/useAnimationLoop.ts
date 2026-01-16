import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';

/**
 * Core animation hook using requestAnimationFrame
 *
 * Listens to isPlaying, playbackSpeed, loopPlayback from projectStore
 * Updates entity positions smoothly between frames using lerp interpolation
 */
export function useAnimationLoop() {
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);

  const {
    project,
    currentFrameIndex,
    isPlaying,
    playbackSpeed,
    loopPlayback,
    setCurrentFrame,
    pause,
    setPlaybackPosition,
  } = useProjectStore();

  useEffect(() => {
    // Exit early if not playing or no project
    if (!isPlaying || !project) {
      startTimeRef.current = null;
      elapsedTimeRef.current = 0;
      return;
    }

    // Exit if no frames
    if (project.frames.length === 0) {
      return;
    }

    const animate = (timestamp: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      // Calculate elapsed time since animation started
      const deltaTime = timestamp - startTimeRef.current;
      startTimeRef.current = timestamp;

      // Apply playback speed multiplier
      elapsedTimeRef.current += deltaTime * playbackSpeed;

      // Get current frame
      const currentFrame = project.frames[currentFrameIndex];
      if (!currentFrame) {
        pause();
        return;
      }

      // Calculate progress through current frame (0-1)
      const progress = elapsedTimeRef.current / currentFrame.duration;

      if (progress >= 1.0) {
        // Frame transition complete
        elapsedTimeRef.current = 0;

        // Determine next frame
        const isLastFrame = currentFrameIndex >= project.frames.length - 1;

        if (isLastFrame) {
          if (loopPlayback) {
            // Loop back to first frame
            setCurrentFrame(0);
          } else {
            // Stop playback
            pause();
            return;
          }
        } else {
          // Advance to next frame
          setCurrentFrame(currentFrameIndex + 1);
        }
      } else {
        // Update playback position for smooth interpolation
        const nextFrameIndex = currentFrameIndex + 1 >= project.frames.length
          ? (loopPlayback ? 0 : currentFrameIndex)
          : currentFrameIndex + 1;

        setPlaybackPosition({
          fromFrameIndex: currentFrameIndex,
          toFrameIndex: nextFrameIndex,
          progress: progress,
        });
      }

      // Continue animation loop
      rafIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    isPlaying,
    project,
    currentFrameIndex,
    playbackSpeed,
    loopPlayback,
    setCurrentFrame,
    pause,
    setPlaybackPosition,
  ]);
}
