'use client';

import React, { useMemo, useRef, type ReactNode } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Circle, Ellipse, RegularPolygon, Text, Group } from 'react-konva';
import { useShareCanvasSize } from '@/features/practice/hooks/useShareCanvasSize';
import { DESIGN_TOKENS } from '@/shared/design-tokens';
import { positionsAt, type PassFlight, type Point, type ResolvedMarker, type ResolvedStep } from '@/features/practice/engine';
import { CONE_OUTLINE, markerColour } from '@/features/practice/markerColour';
import { gridSpacing, isPitch, markerRadius, pitchLines } from '@/features/practice/area';

/** Below this many pixels between grid lines they are too dense to draw. */
const MIN_GRID_PX = 6;
/** Colour of pitch markings. */
const PITCH_LINE_COLOUR = 'rgba(255,255,255,0.75)';
/** Colour of a forward pass arrow in the editor. */
const FORWARD_PASS_COLOUR = DESIGN_TOKENS.colours.accentWarm;
/** Colour of run lines and pass arrows. */
const LINE_COLOUR = 'rgba(255,255,255,0.7)';

/** How much bigger the ball looks at the top of a kick. */
const KICK_LIFT = 0.6;
/** How far, in marker radii, a ball under Lying kit sits off centre so its end shows past the kit. */
const UNDER_KIT_OFFSET = 0.9;

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

export function MarkerShape({ marker, x, y, r, scale = 1 }: { marker: ResolvedMarker; x: number; y: number; r: number; scale?: number }) {
  const fill = markerColour(marker);
  switch (marker.kind) {
    case 'ball':
      return <Ellipse x={x} y={y} radiusX={r * 0.7 * scale} radiusY={r * 0.45 * scale} fill={fill} stroke="#111827" strokeWidth={1} />;
    case 'cone':
      return <RegularPolygon x={x} y={y} sides={3} radius={r * 0.6} fill={fill} stroke={CONE_OUTLINE} strokeWidth={1.5} />;
    case 'tackle-shield': {
      // Lying is the upright shield turned 90 degrees: flat on the ground.
      const [w, h] = marker.lying ? [r * 2, r * 1.2] : [r * 1.2, r * 2];
      return <Rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={fill} stroke="#111827" strokeWidth={1} />;
    }
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
  /** Ids of passes to mark amber (forward passes, in the editor only). */
  forwardPasses?: ReadonlySet<string>;
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
export function PracticeCanvas({ step, time, overlay, forwardPasses }: PracticeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: areaW, length: areaL } = step.area;
  const { width, height, measured } = useShareCanvasSize(containerRef, areaW / areaL);
  const cellPx = width / areaW;
  const radius = markerRadius(step.area, cellPx);
  const { positions, passes } = positionsAt(step, time);
  const px = (cell: number) => (cell + 0.5) * cellPx;
  const markers = drawOrder(step.markers, positions, passes, time);

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
      {measured && <Stage width={width} height={height}>
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
          {passes.map((pass) => {
            const colour = forwardPasses?.has(pass.id) ? FORWARD_PASS_COLOUR : LINE_COLOUR;
            const [x1, y1, x2, y2] = [px(pass.start.x), px(pass.start.y), px(pass.end.x), px(pass.end.y)];
            // A kick arches: the middle control point is lifted off the straight line, to the left of the flight.
            const arch = Math.hypot(x2 - x1, y2 - y1) * 0.25;
            const [dx, dy] = [x2 - x1, y2 - y1];
            const len = Math.hypot(dx, dy) || 1;
            const mid = [(x1 + x2) / 2 + (dy / len) * arch, (y1 + y2) / 2 - (dx / len) * arch];
            return (
              <Arrow
                key={`pass-${pass.id}`}
                points={pass.kick ? [x1, y1, mid[0], mid[1], x2, y2] : [x1, y1, x2, y2]}
                tension={pass.kick ? 0.5 : 0}
                dash={pass.kick ? [8, 6] : undefined}
                stroke={colour}
                fill={colour}
                strokeWidth={forwardPasses?.has(pass.id) ? 3 : 2}
                pointerLength={8}
                pointerWidth={8}
              />
            );
          })}
        </Layer>
        <Layer listening={false}>
          {markers.map(({ marker, underKit }) => {
            const p = positions[marker.id];
            // The ball grows then shrinks over a kick to suggest height.
            const kick = passes.find((f) => f.kick && f.ball === marker.id && time >= f.fire && time < f.land);
            const scale = kick ? 1 + KICK_LIFT * Math.sin(Math.PI * ((time - kick.fire) / (kick.land - kick.fire))) : 1;
            const x = px(p.x) + (underKit ? radius * UNDER_KIT_OFFSET : 0);
            return <MarkerShape key={marker.id} marker={marker} x={x} y={px(p.y)} r={radius} scale={scale} />;
          })}
        </Layer>
        {overlay?.({ width, height, cellPx, radius })}
      </Stage>}
    </div>
  );
}

export default PracticeCanvas;
