'use client';

import { useMemo, useRef } from 'react';
import { Stage, Layer, Rect, Line, Circle, Ellipse, RegularPolygon, Text, Group } from 'react-konva';
import { useShareCanvasSize } from '@/core/hooks/useShareCanvasSize';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { EntityColors } from '@/features/animation/services/entityColors';
import { positionsAt, type ResolvedMarker, type ResolvedStep } from '@/features/practice/engine';

/** Smallest marker radius on screen, in CSS pixels. */
const MIN_MARKER_RADIUS_PX = 6;
/** Marker radius as a fraction of one cell. */
const MARKER_RADIUS_CELLS = 0.4;
/** Below this many pixels per cell the grid lines are too dense to draw. */
const MIN_GRID_PX = 6;

function markerColour(marker: ResolvedMarker): string {
  switch (marker.kind) {
    case 'attacker':
    case 'defender': {
      const team = marker.team ?? (marker.kind === 'attacker' ? 'attack' : 'defence');
      return EntityColors.getDefault('player', team === 'attack' ? 'attack' : 'defense');
    }
    case 'coach':
      return EntityColors.getDefault('player', 'other');
    case 'ball':
      return EntityColors.getDefault('ball');
    case 'cone':
      return EntityColors.getDefault('cone');
    case 'tackle-shield':
      return EntityColors.getDefault('tackle-shield');
  }
}

function MarkerShape({ marker, x, y, r }: { marker: ResolvedMarker; x: number; y: number; r: number }) {
  const fill = markerColour(marker);
  switch (marker.kind) {
    case 'ball':
      return <Ellipse x={x} y={y} radiusX={r * 0.7} radiusY={r * 0.45} fill={fill} stroke="#111827" strokeWidth={1} />;
    case 'cone':
      return <RegularPolygon x={x} y={y} sides={3} radius={r * 0.6} fill={fill} stroke="#111827" strokeWidth={1} />;
    case 'tackle-shield':
      return <Rect x={x - r * 0.6} y={y - r} width={r * 1.2} height={r * 2} fill={fill} stroke="#111827" strokeWidth={1} />;
    default:
      return (
        <Group x={x} y={y}>
          <Circle radius={r} fill={fill} stroke="#FFFFFF" strokeWidth={2} />
          {marker.label && (
            <Text
              text={marker.label}
              width={r * 2}
              height={r * 2}
              offsetX={r}
              offsetY={r}
              align="center"
              verticalAlign="middle"
              fontSize={Math.max(r * 0.9, 9)}
              fontStyle="bold"
              fill="#FFFFFF"
            />
          )}
        </Group>
      );
  }
}

interface PracticeCanvasProps {
  step: ResolvedStep;
  /** Seconds into the Step. */
  time: number;
}

/**
 * Konva renderer for a Practice Step. Fits the Area's aspect ratio to its container.
 */
export function PracticeCanvas({ step, time }: PracticeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: areaW, length: areaL } = step.area;
  const { width, height } = useShareCanvasSize(containerRef, areaW / areaL);
  const cellPx = width / areaW;
  const radius = Math.max(cellPx * MARKER_RADIUS_CELLS, MIN_MARKER_RADIUS_PX);
  const { positions } = positionsAt(step, time);

  const gridLines = useMemo(() => {
    if (cellPx < MIN_GRID_PX) return [];
    const lines: number[][] = [];
    for (let i = 1; i < areaW; i++) lines.push([i * cellPx, 0, i * cellPx, height]);
    for (let j = 1; j < areaL; j++) lines.push([0, j * cellPx, width, j * cellPx]);
    return lines;
  }, [areaW, areaL, cellPx, width, height]);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <Stage width={width} height={height}>
        <Layer listening={false}>
          <Rect width={width} height={height} fill={DESIGN_TOKENS.colours.primary} />
          {gridLines.map((points, i) => (
            <Line key={i} points={points} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          ))}
        </Layer>
        <Layer listening={false}>
          {step.markers.map((marker) => {
            const p = positions[marker.id];
            return (
              <MarkerShape
                key={marker.id}
                marker={marker}
                x={(p.x + 0.5) * cellPx}
                y={(p.y + 0.5) * cellPx}
                r={radius}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default PracticeCanvas;
