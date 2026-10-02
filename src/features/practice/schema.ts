/**
 * Practice Script schema, version 1.
 *
 * This Zod definition is the single source of truth. The published JSON Schema
 * (`practice-script.schema.json`) is generated from it with
 * `npm run generate:practice-schema`, so the two cannot drift.
 *
 * Keep this file free of path-alias and relative imports: the generator runs it
 * directly under Node.
 */
import { z } from 'zod';

export const SCHEMA_VERSION = 1;

/** Each grid cell is a square this many metres on a side. */
export const CELL_SIZE_M = 1;

/** Largest Area side, in metres (a full pitch with in-goals is about 70 x 144). */
export const MAX_AREA_SIDE_M = 150;

/** Most markers a script may hold. */
export const MAX_MARKERS = 60;

/** Most waypoints a single move may hold. */
export const MAX_WAYPOINTS = 50;

export const MARKER_KINDS = [
  'attacker',
  'defender',
  'ball',
  'cone',
  'tackle-shield',
  'coach',
] as const;

export const TEAMS = ['attack', 'defence'] as const;

export const CellSchema = z
  .strictObject({
    x: z
      .number()
      .int()
      .min(0)
      .describe('Column, counted from 0 at the left edge of the Area.'),
    y: z
      .number()
      .int()
      .min(0)
      .describe('Row, counted from 0 at the top edge of the Area.'),
  })
  .describe(
    `A grid cell. Cells are ${CELL_SIZE_M} m squares; an Area W m wide and L m long has columns 0..W-1 and rows 0..L-1.`,
  );

export const AreaSchema = z
  .strictObject({
    width: z
      .number()
      .int()
      .min(1)
      .max(MAX_AREA_SIDE_M)
      .describe('Width in whole metres, drawn left to right (the x axis).'),
    length: z
      .number()
      .int()
      .min(1)
      .max(MAX_AREA_SIDE_M)
      .describe('Length in whole metres, drawn top to bottom (the y axis).'),
  })
  .describe(`The space the Practice happens in. The grid has one ${CELL_SIZE_M} m cell per square metre.`);

export const MarkerSchema = z
  .strictObject({
    id: z
      .string()
      .min(1)
      .max(32)
      .describe('Unique id used by placements and moves, e.g. "a1".'),
    kind: z.enum(MARKER_KINDS).describe('What the marker represents.'),
    team: z
      .enum(TEAMS)
      .optional()
      .describe('Side the marker plays for. Defaults to attack for attackers and defence for defenders.'),
    label: z
      .string()
      .max(4)
      .optional()
      .describe('Short role or number shown on the marker, e.g. "9" or "SH". Never a player name.'),
  })
  .describe('Something drawn in the Area: a player, the ball or equipment.');

export const PlacementSchema = z
  .strictObject({
    marker: z.string().describe('Id of the marker being placed.'),
    cell: CellSchema.describe('Cell the marker starts on.'),
  })
  .describe('Where a marker starts in the Step.');

export const MoveSchema = z
  .strictObject({
    marker: z.string().describe('Id of the marker that moves.'),
    waypoints: z
      .array(CellSchema)
      .min(1)
      .max(MAX_WAYPOINTS)
      .describe('Cells the marker runs to, in order. The marker passes through them without stopping and rests on the last.'),
  })
  .describe(
    'A run by one marker, starting at time zero from its placement, at the default teaching Pace. Duration comes from distance and Pace.',
  );

export const BaseStepSchema = z
  .strictObject({
    placements: z.array(PlacementSchema).describe('Every marker placed exactly once.'),
    moves: z.array(MoveSchema).default([]).describe('At most one move per marker.'),
  })
  .describe('Step 0 of the Practice.');

export const PracticeScriptSchema = z
  .strictObject({
    schemaVersion: z.literal(SCHEMA_VERSION).describe('Version of this format. Always 1.'),
    title: z.string().max(120).optional().describe('Short name for the Practice.'),
    area: AreaSchema,
    markers: z.array(MarkerSchema).min(1).max(MAX_MARKERS),
    base: BaseStepSchema,
  })
  .describe('A Practice Script: a rugby coaching Practice laid out on a grid of cells and animated by moves.');

export type Cell = z.infer<typeof CellSchema>;
export type Area = z.infer<typeof AreaSchema>;
export type MarkerKind = (typeof MARKER_KINDS)[number];
export type Team = (typeof TEAMS)[number];
export type Marker = z.infer<typeof MarkerSchema>;
export type Placement = z.infer<typeof PlacementSchema>;
export type Move = z.infer<typeof MoveSchema>;
export type PracticeScript = z.infer<typeof PracticeScriptSchema>;
