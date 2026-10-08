'use client';

import { useState } from 'react';
import { Layer, Rect, Circle, Group, Text, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Vector2d } from 'konva/lib/types';
import { positionsAt, type ResolvedStep } from '@/features/practice/engine';
import { MarkerShape, type CanvasGeometry } from '@/features/practice/components/PracticeCanvas';
import { NO_SELECTION, type CellPoint, type Edit, type EditorSelection, type EditorTool } from '@/features/practice/editing';
import type { MarkerKind } from '@/features/practice/schema';


const HIGHLIGHT = '#FACC15';
const isPlaceTool = (tool: EditorTool) => tool !== 'select' && tool !== 'run' && tool !== 'pass';

interface EditLayerProps {
  /** The Step being edited (base or Progression), resolved, at time zero. */
  step: ResolvedStep;
  geometry: CanvasGeometry;
  tool: EditorTool;
  selection: EditorSelection;
  /** The ball a new pass moves, when the Area has more than one. */
  ball?: string;
  /** The next pass added is a Kick. */
  kick?: boolean;
  /** The pass whose catch point is being picked: its receiver's Run is highlighted and tappable. */
  catchPass?: string;
  /** A pass to a receiver was added (so the Coach can now pick where it is caught). */
  onPassAdded?: (to: string) => void;
  /** The Coach is done picking a catch point (set, or kept at the end of the Run). */
  onCatchDone?: () => void;
  onSelect: (selection: EditorSelection) => void;
  /** Make an edit; returns whether it was made. */
  onEdit: (edit: Edit) => boolean;
}

/**
 * Konva layer over the Practice for hand editing the base Step: taps place markers,
 * drags snap markers and waypoints to cells, and selection rings show what is picked.
 */
export function PracticeEditLayer({ step, geometry, tool, selection, ball, kick, catchPass, onPassAdded, onCatchDone, onSelect, onEdit }: EditLayerProps) {
  const { width, height, cellPx, radius } = geometry;
  const [dragging, setDragging] = useState<string | null>(null);
  const px = (cell: number) => (cell + 0.5) * cellPx;
  const toCell = (p: Vector2d): CellPoint => ({ x: p.x / cellPx - 0.5, y: p.y / cellPx - 0.5 });
  const maxX = step.area.width - 1;
  const maxY = step.area.length - 1;
  const snap = (p: Vector2d): Vector2d => ({
    x: px(Math.min(Math.max(Math.round(p.x / cellPx - 0.5), 0), maxX)),
    y: px(Math.min(Math.max(Math.round(p.y / cellPx - 0.5), 0), maxY)),
  });
  const pointer = (e: KonvaEventObject<Event>) => {
    const p = e.target.getStage()?.getPointerPosition();
    return p ? toCell(p) : null;
  };

  const catching = catchPass ? step.passes.find((p) => p.id === catchPass) : undefined;
  const catchRun = catching ? step.moves.find((m) => m.marker === catching.to) : undefined;
  const catchStart = catching ? step.markers.find((m) => m.id === catching.to)?.cell : undefined;

  /** Catch at `at` (cell units) on the Run being picked. */
  const pickCatch = (at: CellPoint | null) => {
    if (catching && at && onEdit({ type: 'addCatchPoint', id: catching.id, at })) onCatchDone?.();
  };

  const tapBackground = (e: KonvaEventObject<Event>) => {
    const at = pointer(e);
    if (!at || catching) return;
    if (isPlaceTool(tool)) onEdit({ type: 'addMarker', kind: tool as MarkerKind, at });
    else if (tool === 'run' && selection.marker) {
      if (onEdit({ type: 'addWaypoint', marker: selection.marker, at })) onSelect({ ...selection, waypoint: null });
    } else onSelect(NO_SELECTION);
  };

  const tapMarker = (id: string) => {
    if (tool === 'pass' && selection.marker && selection.marker !== id) {
      if (onEdit({ type: 'addPass', from: selection.marker, to: id, ball, kick })) {
        onPassAdded?.(id);
        onSelect({ marker: id, waypoint: null });
      }
      return;
    }
    onCatchDone?.();
    onSelect({ marker: id, waypoint: null });
  };

  const handles = step.markers.filter((m) => m.kind !== 'ball');
  const run = selection.marker ? step.moves.find((m) => m.marker === selection.marker) : undefined;
  const canDrag = tool === 'select' || tool === 'run';
  const handlesListen = !isPlaceTool(tool);

  return (
    <Layer>
      <Rect width={width} height={height} fill="transparent" onClick={tapBackground} onTap={tapBackground} />
      {catchRun && catchStart && (
        <Line
          points={[catchStart, ...catchRun.waypoints].flatMap((c) => [px(c.x), px(c.y)])}
          stroke={HIGHLIGHT}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={Math.max(cellPx, 44)}
          onClick={(e) => pickCatch(pointer(e))}
          onTap={(e) => pickCatch(pointer(e))}
        />
      )}
      {handles.map((marker) => {
        const selected = selection.marker === marker.id;
        return (
          <Group
            key={marker.id}
            x={px(marker.cell.x)}
            y={px(marker.cell.y)}
            listening={handlesListen}
            draggable={canDrag}
            dragBoundFunc={snap}
            onDragStart={() => {
              setDragging(marker.id);
              onSelect({ marker: marker.id, waypoint: null });
            }}
            onDragEnd={(e) => {
              setDragging(null);
              onEdit({ type: 'moveMarker', marker: marker.id, at: toCell(e.target.position()) });
            }}
            onClick={() => tapMarker(marker.id)}
            onTap={() => tapMarker(marker.id)}
          >
            {dragging === marker.id && <MarkerShape marker={marker} x={0} y={0} r={radius} />}
            <Circle
              radius={Math.max(radius, 12)}
              fill="transparent"
              stroke={selected ? HIGHLIGHT : undefined}
              strokeWidth={selected ? 3 : 0}
            />
          </Group>
        );
      })}
      {run?.waypoints.map((cell, index) => {
        const selected = selection.waypoint === index;
        return (
          <Group
            key={`wp-${index}`}
            x={px(cell.x)}
            y={px(cell.y)}
            listening={handlesListen}
            draggable={handlesListen}
            dragBoundFunc={snap}
            onDragEnd={(e) => {
              onEdit({ type: 'moveWaypoint', marker: run.marker, index, at: toCell(e.target.position()) });
              onSelect({ marker: run.marker, waypoint: index });
            }}
            onClick={() => (catching ? pickCatch(cell) : onSelect({ marker: run.marker, waypoint: index }))}
            onTap={() => (catching ? pickCatch(cell) : onSelect({ marker: run.marker, waypoint: index }))}
          >
            <Circle radius={12} fill="transparent" />
            <Circle
              radius={Math.max(radius * 0.45, 6)}
              fill={selected ? HIGHLIGHT : 'rgba(255,255,255,0.85)'}
              stroke="#111827"
              strokeWidth={1}
            />
            <Text
              text={String(index + 1)}
              x={Math.max(radius * 0.45, 6) + 2}
              y={-14}
              fontSize={11}
              fill="#FFFFFF"
              listening={false}
            />
          </Group>
        );
      })}
    </Layer>
  );
}

/** How far back, in seconds, the "a moment ago" ghost trails. */
const GHOST_LAG_S = 0.6;

/**
 * Ghost mode: faint markers where they were at the start of the Step and a moment ago,
 * so a viewer can see where each one came from.
 */
export function PracticeGhostLayer({ step, time, geometry }: { step: ResolvedStep; time: number; geometry: CanvasGeometry }) {
  if (time <= 0) return null;
  const { cellPx, radius } = geometry;
  const px = (cell: number) => (cell + 0.5) * cellPx;
  const start = positionsAt(step, 0).positions;
  const recent = positionsAt(step, Math.max(0, time - GHOST_LAG_S)).positions;
  return (
    <Layer listening={false}>
      {[
        { positions: start, opacity: 0.3 },
        { positions: recent, opacity: 0.2 },
      ].map(({ positions, opacity }, i) => (
        <Group key={i} opacity={opacity}>
          {step.markers.map((marker) => {
            const p = positions[marker.id];
            return <MarkerShape key={marker.id} marker={marker} x={px(p.x)} y={px(p.y)} r={radius} />;
          })}
        </Group>
      ))}
    </Layer>
  );
}
