/**
 * Linear interpolation (lerp) utilities for animation.
 */

/**
 * Linearly interpolates between two numbers.
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated value
 */
export const lerp = (start: number, end: number, t: number): number => {
    return start + (end - start) * Math.max(0, Math.min(1, t));
};

/**
 * Linearly interpolates between two points.
 * @param start - Starting position { x, y }
 * @param end - Ending position { x, y }
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated position { x, y }
 */
export const lerpPosition = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    t: number
): { x: number; y: number } => ({
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t)
});
