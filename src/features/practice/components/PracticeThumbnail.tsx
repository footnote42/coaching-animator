import { DESIGN_TOKENS } from '@/shared/design-tokens';
import { positionsAt, type ResolvedStep } from '@/features/practice/engine';
import { CONE_OUTLINE, markerColour } from '@/features/practice/markerColour';
import { gridSpacing, isPitch, markerRadius, pitchLines } from '@/features/practice/area';
import { TACKLE_BAG_SHADE, tackleBagShape } from '@/features/practice/tackleBag';

/** Above this many grid lines on a side they are too dense to draw. */
const MAX_GRID_LINES = 40;

interface PracticeThumbnailProps {
  step: ResolvedStep;
  /** Draw each move as a faint dashed path. Defaults to true. */
  showMoves?: boolean;
  /** Accessible name. Omit to hide the image from assistive technology. */
  title?: string;
  className?: string;
  /** Seconds into the Step to draw. Defaults to 0, the resting positions. */
  time?: number;
  /** Draw each marker's label. Defaults to true; off where the thumbnail sits inside a labelled button. */
  showLabels?: boolean;
}

/**
 * Pure SVG render of a Step's positions in its Area: where each marker starts,
 * or where it is `time` seconds in. No Konva and no client code, so it renders
 * on the server and in Gallery cards. Scales to its box, keeping the Area's
 * aspect ratio.
 */
export function PracticeThumbnail({ step, showMoves = true, title, className, time = 0, showLabels = true }: PracticeThumbnailProps) {
  const { width: w, length: l } = step.area;
  const start0 = positionsAt(step, 0).positions;
  const { positions } = time > 0 ? positionsAt(step, time) : { positions: start0 };
  // The SVG is in metres; its on-screen size is unknown here, so no pixel minimum.
  const r = markerRadius(step.area, 1, 0);
  const stroke = r * 0.12;
  const spacing = gridSpacing(step.area);
  const grid = (side: number) => Array.from({ length: Math.ceil(side / spacing) - 1 }, (_, i) => (i + 1) * spacing);

  return (
    <svg
      viewBox={`0 0 ${w} ${l}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width={w} height={l} fill={DESIGN_TOKENS.colours.primary} />
      {Math.max(w, l) / spacing <= MAX_GRID_LINES && (
        <g stroke="rgba(255,255,255,0.12)" strokeWidth={spacing * 0.04}>
          {grid(w).map((x) => (
            <line key={`x${x}`} x1={x} y1={0} x2={x} y2={l} />
          ))}
          {grid(l).map((y) => (
            <line key={`y${y}`} x1={0} y1={y} x2={w} y2={y} />
          ))}
        </g>
      )}
      {isPitch(step.area) && (
        <g stroke="rgba(255,255,255,0.75)" strokeWidth={stroke * 2} fill="none">
          <rect width={w} height={l} />
          {pitchLines(step.area).map(({ y, dashed }) => (
            <line key={y} x1={0} y1={y} x2={w} y2={y} strokeDasharray={dashed ? `${r * 2} ${r * 1.5}` : undefined} />
          ))}
        </g>
      )}
      {showMoves &&
        step.moves.map((move) => {
          const start = start0[move.marker];
          if (!start) return null;
          const points = [start, ...move.waypoints].map((p) => `${p.x + 0.5},${p.y + 0.5}`).join(' ');
          return (
            <polyline
              key={move.marker}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={stroke}
              strokeDasharray={`${r * 0.5} ${r * 0.4}`}
            />
          );
        })}
      {step.markers.map((marker) => {
        const p = positions[marker.id];
        const x = p.x + 0.5;
        const y = p.y + 0.5;
        const fill = markerColour(marker);
        switch (marker.kind) {
          case 'ball':
            return <ellipse key={marker.id} cx={x} cy={y} rx={r * 0.7} ry={r * 0.45} fill={fill} stroke="#111827" strokeWidth={stroke} />;
          case 'cone': {
            const s = r * 0.6;
            const points = `${x},${y - s} ${x + s * 0.866},${y + s / 2} ${x - s * 0.866},${y + s / 2}`;
            return <polygon key={marker.id} points={points} fill={fill} stroke={CONE_OUTLINE} strokeWidth={stroke * 1.5} />;
          }
          case 'tackle-shield': {
            const [w, h] = marker.lying ? [r * 2, r * 1.2] : [r * 1.2, r * 2];
            return <rect key={marker.id} x={x - w / 2} y={y - h / 2} width={w} height={h} fill={fill} stroke="#111827" strokeWidth={stroke} />;
          }
          case 'tackle-bag': {
            const bag = tackleBagShape(x, y, r, marker.lying);
            return (
              <g key={marker.id}>
                <rect x={bag.x} y={bag.y} width={bag.width} height={bag.height} rx={bag.cornerRadius} fill={fill} stroke="#111827" strokeWidth={stroke} />
                <path d={bag.shade} fill={TACKLE_BAG_SHADE} />
              </g>
            );
          }
          default:
            return (
              <g key={marker.id}>
                <circle cx={x} cy={y} r={r} fill={fill} stroke="#FFFFFF" strokeWidth={stroke * 1.5} />
                {showLabels && marker.label && (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={r * 0.9}
                    fontWeight="bold"
                    fill="#FFFFFF"
                  >
                    {marker.label}
                  </text>
                )}
              </g>
            );
        }
      })}
    </svg>
  );
}

export default PracticeThumbnail;
