/**
 * Area templates, grid spacing, pitch markings and marker size. Pure: shared by
 * the Konva canvas, the SVG thumbnails and the share card.
 *
 * All lengths are in metres (one cell is one metre) unless a name says px.
 */
import type { Area, AreaTemplate, Direction } from './schema';

/** Width of the generic full-size pitch, touch line to touch line. */
export const PITCH_WIDTH_M = 70;
/** Field of play, try line to try line. */
export const PITCH_FIELD_OF_PLAY_M = 100;
/** Depth of each in-goal, try line to dead-ball line. */
export const PITCH_IN_GOAL_M = 10;
/** Try line to the 22 m line. */
export const PITCH_22_M = 22;
/** Halfway line to each dashed 10 m line. */
export const PITCH_10_M = 10;

/** Full pitch: both halves plus both in-goals, dead-ball line at the top. */
export const FULL_PITCH_LENGTH_M = PITCH_FIELD_OF_PLAY_M + 2 * PITCH_IN_GOAL_M; // 120
/** Half pitch: one in-goal (at the top) down to halfway (the bottom edge). */
export const HALF_PITCH_LENGTH_M = PITCH_FIELD_OF_PLAY_M / 2 + PITCH_IN_GOAL_M; // 60

/** Size each template starts at when the Coach picks it. */
export const AREA_TEMPLATE_SIZES = {
  square: { width: 20, length: 20 },
  horizontal: { width: 30, length: 20 },
  vertical: { width: 20, length: 30 },
  'half-pitch': { width: PITCH_WIDTH_M, length: HALF_PITCH_LENGTH_M },
  'full-pitch': { width: PITCH_WIDTH_M, length: FULL_PITCH_LENGTH_M },
} as const satisfies Record<AreaTemplate, { width: number; length: number }>;

export const AREA_TEMPLATE_NAMES = {
  square: 'Square',
  horizontal: 'Horizontal rectangle',
  vertical: 'Vertical rectangle',
  'half-pitch': 'Half pitch',
  'full-pitch': 'Full pitch',
} as const satisfies Record<AreaTemplate, string>;

/** A new Area from a template, at the template's starting size. */
export function areaFromTemplate(template: AreaTemplate): Area {
  return { template, ...AREA_TEMPLATE_SIZES[template] };
}

/** The template an Area shows: as given, or for an Area without one, open grass named by its shape. */
export function areaTemplate(area: Area): AreaTemplate {
  if (area.template) return area.template;
  return area.width === area.length ? 'square' : area.width > area.length ? 'horizontal' : 'vertical';
}

export function isPitch(area: Area): boolean {
  return area.template === 'half-pitch' || area.template === 'full-pitch';
}

/** Direction of attack a template starts with: pitch templates attack up the screen (toward the try line), grass has none. */
export function defaultDirection(area: Area): Direction {
  return isPitch(area) ? 'up' : 'none';
}

/**
 * Metres between visible grid lines, following the Area's size: 1 m lines for
 * small grids, 5 m for mid-size Areas and half pitches, 10 m for full pitches.
 * Cells stay 1 m in the script whatever the spacing.
 */
export function gridSpacing(area: Area): number {
  const side = Math.max(area.width, area.length);
  if (side <= 30) return 1;
  if (side <= 70) return 5;
  return 10;
}

export interface PitchLine {
  /** Distance from the top edge, in metres. */
  y: number;
  dashed: boolean;
}

/**
 * Across-the-pitch lines (try lines, 22s, 10 m lines, halfway) for a pitch
 * template, measured from the top edge. Positions are laid out on the template
 * size and stretched to the Area's length, so a resized pitch keeps its
 * proportions. Open grass has none. Touch and dead-ball lines are the Area's edges.
 */
export function pitchLines(area: Area): PitchLine[] {
  const half = PITCH_FIELD_OF_PLAY_M / 2;
  const tryLine = PITCH_IN_GOAL_M;
  const halfway = tryLine + half;
  // Lines in one half, measured from the top dead-ball line.
  const top: PitchLine[] = [
    { y: tryLine, dashed: false },
    { y: tryLine + PITCH_22_M, dashed: false },
    { y: halfway - PITCH_10_M, dashed: true },
  ];
  let lines: PitchLine[];
  let templateLength: number;
  if (area.template === 'full-pitch') {
    templateLength = FULL_PITCH_LENGTH_M;
    const mirrored = top.map((line) => ({ ...line, y: FULL_PITCH_LENGTH_M - line.y })).reverse();
    lines = [...top, { y: halfway, dashed: false }, ...mirrored];
  } else if (area.template === 'half-pitch') {
    templateLength = HALF_PITCH_LENGTH_M;
    lines = top;
  } else {
    return [];
  }
  const k = area.length / templateLength;
  return lines.map((line) => ({ ...line, y: line.y * k }));
}

/** A player marker's radius in metres on a small grid: roughly a body width across. */
export const MARKER_RADIUS_M = 0.4;
/** On bigger Areas markers grow with the longer side, so they stay in proportion to the space. */
export const MARKER_RADIUS_AREA_FRACTION = 0.012;
/** Smallest marker radius on screen, in CSS pixels: keeps a full pitch legible at 375 px wide. */
export const MIN_MARKER_RADIUS_PX = 8;

/**
 * Marker radius in drawing units, given how many units one metre takes
 * (`unitsPerMetre`: CSS pixels on the canvas, 1 in a metre-based SVG). Scales
 * with the Area and never drops below `minUnits` on screen.
 */
export function markerRadius(area: Area, unitsPerMetre: number, minUnits = MIN_MARKER_RADIUS_PX): number {
  const metres = Math.max(MARKER_RADIUS_M, Math.max(area.width, area.length) * MARKER_RADIUS_AREA_FRACTION);
  return Math.max(metres * unitsPerMetre, minUnits);
}
