export const GRID_COLS = 16;
export const GRID_ROWS = 12;

/**
 * Snaps a position to the nearest grid intersection.
 * If snapEnabled is false, returns the original coordinates.
 */
export const snapPosition = (
  x: number,
  y: number,
  stageWidth: number,
  stageHeight: number,
  snapEnabled: boolean = true
): { x: number; y: number } => {
  if (!snapEnabled) {
    return { x, y };
  }

  const cellW = stageWidth / GRID_COLS;
  const cellH = stageHeight / GRID_ROWS;

  // Round to nearest grid intersection
  const snappedX = Math.round(x / cellW) * cellW;
  const snappedY = Math.round(y / cellH) * cellH;

  // Ensure we stay within stage boundaries
  return {
    x: Math.min(Math.max(0, snappedX), stageWidth),
    y: Math.min(Math.max(0, snappedY), stageHeight),
  };
};
