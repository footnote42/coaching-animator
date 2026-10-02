import React from 'react';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { positionsAt, type ResolvedStep } from '@/features/practice/engine';
import { markerColour } from '@/features/practice/markerColour';

/** Marker radius as a fraction of one cell. */
const MARKER_RADIUS_CELLS = 0.4;
/** Smallest marker radius as a fraction of the Area's longer side, so big Areas stay readable. */
const MIN_MARKER_RADIUS_FRACTION = 0.012;
/** Above this many cells on a side the grid lines are too dense to draw. */
const MAX_GRID_CELLS = 40;

interface PracticeThumbnailProps {
  step: ResolvedStep;
  /** Draw each move as a faint dashed path. Defaults to true. */
  showMoves?: boolean;
  /** Accessible name. Omit to hide the image from assistive technology. */
  title?: string;
  className?: string;
}

/**
 * Pure SVG render of a Step's resting positions (where each marker starts) in
 * its Area. No Konva and no client code, so it renders on the server and in
 * Gallery cards. Scales to its box, keeping the Area's aspect ratio.
 */
export function PracticeThumbnail({ step, showMoves = true, title, className }: PracticeThumbnailProps) {
  const { width: w, length: l } = step.area;
  const { positions } = positionsAt(step, 0);
  const r = Math.max(MARKER_RADIUS_CELLS, Math.max(w, l) * MIN_MARKER_RADIUS_FRACTION);
  const stroke = r * 0.12;

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
      {w <= MAX_GRID_CELLS && l <= MAX_GRID_CELLS && (
        <g stroke="rgba(255,255,255,0.12)" strokeWidth={0.04}>
          {Array.from({ length: w - 1 }, (_, i) => (
            <line key={`x${i}`} x1={i + 1} y1={0} x2={i + 1} y2={l} />
          ))}
          {Array.from({ length: l - 1 }, (_, j) => (
            <line key={`y${j}`} x1={0} y1={j + 1} x2={w} y2={j + 1} />
          ))}
        </g>
      )}
      {showMoves &&
        step.moves.map((move) => {
          const start = positions[move.marker];
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
            return <polygon key={marker.id} points={points} fill={fill} stroke="#111827" strokeWidth={stroke} />;
          }
          case 'tackle-shield':
            return <rect key={marker.id} x={x - r * 0.6} y={y - r} width={r * 1.2} height={r * 2} fill={fill} stroke="#111827" strokeWidth={stroke} />;
          default:
            return (
              <g key={marker.id}>
                <circle cx={x} cy={y} r={r} fill={fill} stroke="#FFFFFF" strokeWidth={stroke * 1.5} />
                {marker.label && (
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
