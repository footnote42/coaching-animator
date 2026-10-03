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

/** Largest Area side, in metres (the full-pitch template is 70 x 120). */
export const MAX_AREA_SIDE_M = 150;

/**
 * Templates an Area starts from. The first three are open grass; the pitch
 * templates show pitch markings. Their default sizes live in `area.ts`.
 */
export const AREA_TEMPLATES = ['square', 'horizontal', 'vertical', 'half-pitch', 'full-pitch'] as const;

/** Most markers a script may hold. */
export const MAX_MARKERS = 60;

/** Most waypoints a single move may hold. */
export const MAX_WAYPOINTS = 50;

/** Most balls a script may declare. */
export const MAX_BALLS = 3;

/** Most passes one Step may hold. */
export const MAX_PASSES = 50;

/** Named Paces a move can run at. Their speeds live in the engine (`PACE_SPEEDS_MPS`). */
export const PACES = ['walk', 'jog', 'sprint'] as const;

/** Marker kinds that can hold, pass and receive the ball. */
export const BALL_CARRIER_KINDS = ['attacker', 'defender', 'coach'] as const;

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
    template: z
      .enum(AREA_TEMPLATES)
      .optional()
      .describe(
        'Template the Area started from: square, horizontal or vertical rectangle (open grass), half-pitch or full-pitch (drawn with pitch markings, which stretch to the width and length). Leave out for open grass.',
      ),
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

const MarkerIdSchema = z.string().min(1).max(32);

const StartShape = {
  cell: CellSchema.optional().describe('Cell the marker starts on. Required for every marker except the ball.'),
  holder: MarkerIdSchema.optional().describe(
    'For the ball only, instead of a cell: id of the attacker, defender or coach holding it at the start of the Step. The ball rides with its holder.',
  ),
};

export const PlacementSchema = z
  .strictObject({
    marker: z.string().describe('Id of the marker being placed.'),
    ...StartShape,
  })
  .describe('Where a marker starts in the Step: a cell, or for the ball a holder.');

export const AfterSchema = z
  .strictObject({
    move: MarkerIdSchema.optional().describe('Start when the move of this marker has finished.'),
    pass: MarkerIdSchema.optional().describe('Start when the pass with this id has been caught.'),
  })
  .describe('What a move waits for before it starts. Give exactly one of move or pass. Waits may not loop.');

export const MoveSchema = z
  .strictObject({
    marker: z.string().describe('Id of the marker that moves.'),
    waypoints: z
      .array(CellSchema)
      .min(1)
      .max(MAX_WAYPOINTS)
      .describe('Cells the marker runs to, in order. The marker passes through them without stopping and rests on the last.'),
    pace: z.enum(PACES).optional().describe('How fast the marker runs: walk, jog or sprint. Defaults to jog. All Paces are slower than real time.'),
    after: AfterSchema.optional().describe('Leave out to start at time zero.'),
  })
  .describe(
    'A run by one marker from its starting cell. Duration comes from distance and Pace, never typed. The ball cannot move on its own.',
  );

export const PassSchema = z
  .strictObject({
    id: MarkerIdSchema.describe('Unique id for the pass in its Step, e.g. "p1". Used by after.pass, setPass and removePass.'),
    from: z.string().describe('Id of the marker passing. Must hold the ball when the pass fires.'),
    to: z.string().describe('Id of the marker receiving.'),
    ball: MarkerIdSchema.optional().describe(
      'Id of the ball being passed. Leave out to pass the first ball declared in markers, which is the only ball in most Practices. Each ball has its own chain of passes.',
    ),
    at: z
      .number()
      .int()
      .min(0)
      .max(MAX_WAYPOINTS - 1)
      .optional()
      .describe(
        "Catch on the run: index (from 0) of a waypoint in the receiver's move. The pass fires when the receiver reaches that waypoint, and the receiver runs the rest of its move holding the ball. Leave out to fire at the end of the move. Only for a receiver with a move.",
      ),
  })
  .describe(
    'A pass of a ball. Passes of one ball fire in list order: each fires once the previous one is caught and the receiver has arrived (at waypoint "at" of its move if given, else the end of its move, or straight away if it has no move, or if its move is still waiting on this pass). Balls run at the same time.',
  );

export const LEVERS = ['space', 'time', 'equipment', 'people'] as const;

/** Most coaching points one Step may carry. */
export const MAX_COACHING_POINTS = 10;

export const CommentarySchema = z
  .strictObject({
    points: z
      .array(z.string().min(1).max(200))
      .max(MAX_COACHING_POINTS)
      .default([])
      .describe('Coaching points shown over the Step as it plays. For a Progression, the first says why the Step is harder.'),
  })
  .describe('The words shown over a Step as it plays. The viewer can toggle it.');

export const BaseStepSchema = z
  .strictObject({
    placements: z
      .array(PlacementSchema)
      .describe('Markers on the Area in Step 0, each placed at most once. A marker left out must be added by a Progression.'),
    moves: z.array(MoveSchema).default([]).describe('At most one move per marker.'),
    passes: z.array(PassSchema).max(MAX_PASSES).default([]).describe('Passes in the order they happen.'),
    commentary: CommentarySchema.default({ points: [] }),
  })
  .describe('Step 0 of the Practice.');

export const AddMarkerChangeSchema = z
  .strictObject({
    type: z.literal('addMarker'),
    marker: z.string().describe('Id of a marker that is not on the Area in the previous Step.'),
    ...StartShape,
  })
  .describe('Put a marker on the Area from this Step onward.');

export const RemoveMarkerChangeSchema = z
  .strictObject({
    type: z.literal('removeMarker'),
    marker: z.string().describe('Id of a marker on the Area in the previous Step.'),
  })
  .describe('Take a marker, and its move, off the Area from this Step onward.');

export const PlaceMarkerChangeSchema = z
  .strictObject({
    type: z.literal('placeMarker'),
    marker: z.string().describe('Id of a marker on the Area in the previous Step.'),
    ...StartShape,
  })
  .describe('Change where a marker starts (or, for the ball, who holds it). Its move, if any, is kept and runs from the new cell.');

export const SetMoveChangeSchema = z
  .strictObject({
    type: z.literal('setMove'),
    ...MoveSchema.shape,
  })
  .describe("Add a move for a marker, or replace the marker's existing move.");

export const RemoveMoveChangeSchema = z
  .strictObject({
    type: z.literal('removeMove'),
    marker: z.string().describe('Id of a marker that has a move in the previous Step.'),
  })
  .describe("Remove a marker's move so it stays on its cell.");

export const SetPassChangeSchema = z
  .strictObject({
    type: z.literal('setPass'),
    ...PassSchema.shape,
  })
  .describe('Replace the pass with this id in place, or add it after the existing passes.');

export const RemovePassChangeSchema = z
  .strictObject({
    type: z.literal('removePass'),
    id: z.string().describe('Id of a pass in the previous Step.'),
  })
  .describe('Remove a pass.');

export const SetAreaChangeSchema = z
  .strictObject({
    type: z.literal('setArea'),
    ...AreaSchema.shape,
  })
  .describe(
    'Replace the Area (its template, width and length) from this Step onward. Only in a Progression that pulls the Space lever. Every cell used from this Step on must fit the new Area.',
  );

export const ChangeSchema = z
  .discriminatedUnion('type', [
    AddMarkerChangeSchema,
    RemoveMarkerChangeSchema,
    PlaceMarkerChangeSchema,
    SetMoveChangeSchema,
    RemoveMoveChangeSchema,
    SetPassChangeSchema,
    RemovePassChangeSchema,
    SetAreaChangeSchema,
  ])
  .describe('One change over the previous Step. Changes apply in order.');

export const ProgressionSchema = z
  .strictObject({
    lever: z.enum(LEVERS).describe('The STEP lever this Progression pulls: Space, Time, Equipment or People.'),
    commentary: CommentarySchema.default({ points: [] }),
    changes: z.array(ChangeSchema).describe('What this Step changes over the previous Step, applied in order. Empty while a Progression is being built.'),
  })
  .describe('A Step that develops the previous Step. Stores only its change, so edits to earlier Steps carry forward.');

export const PracticeScriptSchema = z
  .strictObject({
    schemaVersion: z.literal(SCHEMA_VERSION).describe('Version of this format. Always 1.'),
    title: z.string().max(120).optional().describe('Short name for the Practice.'),
    area: AreaSchema,
    markers: z
      .array(MarkerSchema)
      .min(1)
      .max(MAX_MARKERS)
      .describe('Every marker used in any Step, declared once. At most 3 balls.'),
    base: BaseStepSchema,
    progressions: z
      .array(ProgressionSchema)
      .default([])
      .describe('Progressions in order. Progression i is Step i + 1 and builds on Step i.'),
  })
  .describe('A Practice Script: a rugby coaching Practice laid out on a grid of cells and animated by moves and passes.');

export type Cell = z.infer<typeof CellSchema>;
export type Area = z.infer<typeof AreaSchema>;
export type AreaTemplate = (typeof AREA_TEMPLATES)[number];
export type MarkerKind = (typeof MARKER_KINDS)[number];
export type Team = (typeof TEAMS)[number];
export type Marker = z.infer<typeof MarkerSchema>;
export type Placement = z.infer<typeof PlacementSchema>;
export type Move = z.infer<typeof MoveSchema>;
export type Pace = (typeof PACES)[number];
export type Pass = z.infer<typeof PassSchema>;
export type Lever = (typeof LEVERS)[number];
export type Commentary = z.infer<typeof CommentarySchema>;
export type Change = z.infer<typeof ChangeSchema>;
export type Progression = z.infer<typeof ProgressionSchema>;
export type PracticeScript = z.infer<typeof PracticeScriptSchema>;
