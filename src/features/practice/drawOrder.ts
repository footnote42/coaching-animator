import type { PassFlight, Point, ResolvedMarker } from '@/features/practice/engine';

/**
 * Drawing order, bottom to top: balls resting under Lying kit, the Lying kit,
 * every other marker, then the other balls (on top of their holders). Players
 * cross over Lying kit; a ball under it shows only past its edge.
 */
export function drawOrder(
  markers: ResolvedMarker[],
  positions: Record<string, Point>,
  passes: PassFlight[],
  time: number,
): { marker: ResolvedMarker; underKit: boolean }[] {
  const kit = markers.filter((m) => m.lying);
  const flying = (id: string) => passes.some((f) => f.ball === id && time >= f.fire && time < f.land);
  const underKit = (m: ResolvedMarker) =>
    m.kind === 'ball' &&
    !flying(m.id) &&
    kit.some((k) => Math.hypot(positions[k.id].x - positions[m.id].x, positions[k.id].y - positions[m.id].y) < 0.5);
  const balls = markers.filter((m) => m.kind === 'ball');
  const under = balls.filter(underKit);
  return [
    ...under.map((marker) => ({ marker, underKit: true })),
    ...kit.map((marker) => ({ marker, underKit: false })),
    ...markers.filter((m) => m.kind !== 'ball' && !m.lying).map((marker) => ({ marker, underKit: false })),
    ...balls.filter((m) => !under.includes(m)).map((marker) => ({ marker, underKit: false })),
  ];
}
