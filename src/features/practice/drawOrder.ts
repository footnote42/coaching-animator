import type { PassFlight, Point, ResolvedMarker } from '@/features/practice/engine';
import type { LyingKind } from '@/features/practice/schema';

/**
 * Drawing order, bottom to top: balls resting under Lying kit, the Lying kit,
 * every other marker, then the other balls (on top of their holders). Players
 * cross over Lying kit; a ball under it shows only past its edge. A resting ball
 * is held, placed loose or at rest after a Kick to space. `underKit` names the
 * kind of Lying kit (tackle shield or tackle bag) a ball is under, or is null.
 */
export function drawOrder(
  markers: ResolvedMarker[],
  positions: Record<string, Point>,
  passes: PassFlight[],
  time: number,
): { marker: ResolvedMarker; underKit: LyingKind | null }[] {
  const kit = markers.filter((m) => m.lying);
  const flying = (id: string) => passes.some((f) => f.ball === id && time >= f.fire && time < f.land);
  /** The kind of Lying kit a resting ball is under, if any. */
  const kitOver = (m: ResolvedMarker): LyingKind | null => {
    if (m.kind !== 'ball' || flying(m.id)) return null;
    const over = kit.find((k) => Math.hypot(positions[k.id].x - positions[m.id].x, positions[k.id].y - positions[m.id].y) < 0.5);
    return over ? (over.kind as LyingKind) : null;
  };
  const balls = markers.filter((m) => m.kind === 'ball').map((marker) => ({ marker, underKit: kitOver(marker) }));
  return [
    ...balls.filter((b) => b.underKit),
    ...kit.map((marker) => ({ marker, underKit: null })),
    ...markers.filter((m) => m.kind !== 'ball' && !m.lying).map((marker) => ({ marker, underKit: null })),
    ...balls.filter((b) => !b.underKit),
  ];
}
