'use client';

import { useMemo, useRef, type ReactNode } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Circle, Ellipse, RegularPolygon, Text, Group } from 'react-konva';
import { useShareCanvasSize } from '@/core/hooks/useShareCanvasSize';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { positionsAt, type ResolvedMarker, type ResolvedStep } from '@/features/practice/engine';
import { markerColour } from '@/features/practice/markerColour';
import { gridSpacing, isPitch, markerRadius, pitchLines } from '@/features/practice/area';

/** Below this many pixels between grid lines they are too dense to draw. */
const MIN_GRID_PX = 6;
/** Colour of pitch markings. */
const PITCH_LINE_COLOUR = 'rgba(255,255,255,0.75)';
/** Colour of run lines and pass arrows. */
const LINE_COLOUR = 'rgba(255,255,255,0.7)';

export function MarkerShape({ marker, x, y, r }: { marker: ResolvedMarker; x: number; y: number; r: number }) {
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
  /** Extra Konva layers drawn on top (editing handles, ghosts), given the canvas geometry. */
  overlay?: (geometry: CanvasGeometry) => ReactNode;
}

/** How cells map to canvas pixels, for layers drawn over the Practice. */
export interface CanvasGeometry {
  width: number;
  height: number;
  /** Pixels per cell. */
  cellPx: number;
  /** Marker radius in pixels. */
  radius: number;
}

/**
 * Konva renderer for a Practice Step. Fits the Area's aspect ratio to its container.
 */
export function PracticeCanvas({ step, time, overlay }: PracticeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: areaW, length: areaL } = step.area;
  const { width, height } = useShareCanvasSize(containerRef, areaW / areaL);
  const cellPx = width / areaW;
  const radius = markerRadius(step.area, cellPx);
  const { positions, passes } = positionsAt(step, time);
  const px = (cell: number) => (cell + 0.5) * cellPx;
  // Draw the ball last so it sits on top of its holder.
  const markers = [...step.markers.filter((m) => m.kind !== 'ball'), ...step.markers.filter((m) => m.kind === 'ball')];

  const spacing = gridSpacing(step.area);
  const gridLines = useMemo(() => {
    if (spacing * cellPx < MIN_GRID_PX) return [];
    const lines: number[][] = [];
    for (let i = spacing; i < areaW; i += spacing) lines.push([i * cellPx, 0, i * cellPx, height]);
    for (let j = spacing; j < areaL; j += spacing) lines.push([0, j * cellPx, width, j * cellPx]);
    return lines;
  }, [areaW, areaL, spacing, cellPx, width, height]);
  const pitch = isPitch(step.area);
  const markings = pitchLines(step.area);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <Stage width={width} height={height}>
        <Layer listening={false}>
          <Rect width={width} height={height} fill={DESIGN_TOKENS.colours.primary} />
          {gridLines.map((points, i) => (
            <Line key={i} points={points} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          ))}
          {pitch && <Rect width={width} height={height} stroke={PITCH_LINE_COLOUR} strokeWidth={2} />}
          {markings.map(({ y, dashed }) => (
            <Line
              key={`pitch-${y}`}
              points={[0, y * cellPx, width, y * cellPx]}
              stroke={PITCH_LINE_COLOUR}
              strokeWidth={2}
              dash={dashed ? [8, 6] : undefined}
            />
          ))}
        </Layer>
        <Layer listening={false}>
          {step.moves.map((move) => {
            const start = step.markers.find((m) => m.id === move.marker)!.cell;
            return (
              <Line
                key={`run-${move.marker}`}
                points={[start, ...move.waypoints].flatMap((c) => [px(c.x), px(c.y)])}
                stroke={LINE_COLOUR}
                strokeWidth={2}
                dash={[6, 6]}
                lineJoin="round"
              />
            );
          })}
          {passes.map((pass) => (
            <Arrow
              key={`pass-${pass.id}`}
              points={[px(pass.start.x), px(pass.start.y), px(pass.end.x), px(pass.end.y)]}
              stroke={LINE_COLOUR}
              fill={LINE_COLOUR}
              strokeWidth={2}
              pointerLength={8}
              pointerWidth={8}
            />
          ))}
        </Layer>
        <Layer listening={false}>
          {markers.map((marker) => {
            const p = positions[marker.id];
            return <MarkerShape key={marker.id} marker={marker} x={px(p.x)} y={px(p.y)} r={radius} />;
          })}
        </Layer>
        {overlay?.({ width, height, cellPx, radius })}
      </Stage>
    </div>
  );
}

export default PracticeCanvas;
