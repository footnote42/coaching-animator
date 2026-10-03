/** Seconds the last frame is held before a Gallery preview loops. */
export const PREVIEW_HOLD_S = 1;

/**
 * Where a looping preview is `elapsed` seconds after it started: plays the Step
 * through, holds the end for PREVIEW_HOLD_S, then starts again. A Step with no
 * movement (duration 0) stays at 0.
 */
export function previewTime(elapsed: number, duration: number): number {
  if (!(duration > 0) || !(elapsed > 0)) return 0;
  return Math.min(elapsed % (duration + PREVIEW_HOLD_S), duration);
}
