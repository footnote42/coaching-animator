interface ThumbnailMarker {
  kind: string;
  team?: string;
  cell: { x: number; y: number };
}

export interface GalleryThumbnailData {
  area: { width: number; length: number };
  markers: ThumbnailMarker[];
}

function fillFor(m: ThumbnailMarker): string {
  if (m.kind === 'ball') return '#ffffff';
  if (m.kind === 'cone') return '#e6ea0c';
  if (m.team === 'defence' || m.kind === 'defender') return '#dc2626';
  if (m.kind === 'attacker') return '#2563eb';
  return '#6b7280';
}

/** Resting positions of the base Step inside the Area, as a pure SVG. */
export function GalleryThumbnail({ area, markers }: GalleryThumbnailData) {
  return (
    <svg
      viewBox={`0 0 ${area.width} ${area.length}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Starting positions"
      className="h-full w-full bg-green-700"
    >
      <rect x={0} y={0} width={area.width} height={area.length} fill="none" stroke="#ffffff" strokeWidth={Math.max(area.width, area.length) / 100} />
      {markers.map((m, i) => (
        <circle
          key={i}
          cx={m.cell.x + 0.5}
          cy={m.cell.y + 0.5}
          r={m.kind === 'ball' || m.kind === 'cone' ? 0.3 : 0.45}
          fill={fillFor(m)}
          stroke="#000000"
          strokeWidth={0.06}
        />
      ))}
    </svg>
  );
}
