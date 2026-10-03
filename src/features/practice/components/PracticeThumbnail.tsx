import React from 'react';
import { DESIGN_TOKENS } from '@/shared/design-tokens';
import { positionsAt, type ResolvedStep } from '@/features/practice/engine';
import { markerColour } from '@/features/practice/markerColour';
import { gridSpacing, isPitch, markerRadius, pitchLines } from '@/features/practice/area';

/** Above this many grid lines on a side they are too dense to draw. */
const MAX_GRID_LINES = 40;

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
