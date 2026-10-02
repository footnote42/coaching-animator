/**
 * Practice Script engine. Pure: no React, DOM or database.
 *
 * Every consumer (editor, share view, Import, thumbnails) goes through:
 * - validate(script)       -> the script, or path-specific plain-language errors
 * - stepCount(script)      -> number of Steps (base plus Progressions)
 * - resolveStep(script, n) -> full state of Step n, with the Progression chain applied
 * - positionsAt(step, t)   -> every marker's position at t seconds, plus the Step's duration
 *
 * Positions are in cell units: { x: 3, y: 4 } is the centre of cell (3, 4).
 */
import {
  CELL_SIZE_M,
  PracticeScriptSchema,
  SCHEMA_VERSION,
  type Area,
  type Cell,
  type Change,
  type Commentary,
  type Lever,
  type Marker,
  type Move,
  type PracticeScript,
} from './schema';

/** Largest script accepted, in bytes of JSON text. */
export const MAX_SCRIPT_BYTES = 64 * 1024;

/**
 * Teaching Pace speeds in metres per second, deliberately slower than real
 * time so viewers can follow the idea. Tune by eye once real Practices exist.
 */
export const PACE_SPEEDS_MPS = {
  walk: 1,
  jog: 2,
  sprint: 4,
} as const;

export type Pace = keyof typeof PACE_SPEEDS_MPS;

export const DEFAULT_PACE: Pace = 'jog';

export interface ValidationError {
  /** Field path, e.g. `base.moves[2].marker`. Empty string means the whole script. */
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; script: PracticeScript }
  | { ok: false; errors: ValidationError[] };

export interface ResolvedMarker extends Marker {
  cell: Cell;
}

export interface ResolvedStep {
  index: number;
  area: Area;
  /** Markers on the Area in this Step, in the order the script declares them. */
  markers: ResolvedMarker[];
  moves: Move[];
  /** The STEP lever this Step pulls. Undefined for the base Step. */
  lever?: Lever;
  commentary: Commentary;
}

export interface Point {
  x: number;
  y: number;
}

export interface StepPositions {
  /** Seconds the Step takes to play out. */
  duration: number;
  /** Position of every marker, keyed by marker id, in cell units. */
  positions: Record<string, Point>;
}

export function formatPath(path: ReadonlyArray<PropertyKey>): string {
  return path
    .map((part, i) =>
      typeof part === 'number' ? `[${part}]` : `${i === 0 ? '' : '.'}${String(part)}`,
    )
    .join('');
}

export function formatError(error: ValidationError): string {
  return error.path ? `${error.path}: ${error.message}` : error.message;
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function valueAt(root: unknown, path: ReadonlyArray<PropertyKey>): unknown {
  let current: unknown = root;
  for (const part of path) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<PropertyKey, unknown>)[part];
  }
  return current;
}

interface Issue {
  code: string;
  message: string;
  path: PropertyKey[];
  keys?: string[];
}

function issueMessage(issue: Issue, input: unknown): string {
  if ((issue.code === 'invalid_type' || issue.code === 'invalid_value') && valueAt(input, issue.path) === undefined) {
    return 'is required';
  }
  if (issue.code === 'unrecognized_keys' && issue.keys) {
    const keys = issue.keys;
    return `unknown field${keys.length > 1 ? 's' : ''} ${keys.map((k) => `"${k}"`).join(', ')}`;
  }
  return issue.message.replace(/^Invalid input: /, '');
}

function checkCell(cell: Cell, area: Area, path: string, errors: ValidationError[]) {
  if (cell.x >= area.width || cell.y >= area.length) {
    errors.push({
      path,
      message: `cell (${cell.x}, ${cell.y}) is outside the ${area.width} x ${area.length} m Area; columns run 0-${area.width - 1} and rows 0-${area.length - 1}`,
    });
  }
}

/** Markers on the Area at one Step: starting cells and moves, keyed by marker id. */
interface StepState {
  cells: Map<string, Cell>;
  moves: Map<string, Move>;
}

/**
 * Apply one change to `state` in place. Returns an error (with a path relative
 * to the change) and leaves `state` untouched if the change does not fit.
 */
function applyChange(state: StepState, change: Change): ValidationError | null {
  const { marker } = change;
  const present = state.cells.has(marker);
  switch (change.type) {
    case 'addMarker':
      if (present) return { path: 'marker', message: `marker "${marker}" is already on the Area in the previous Step` };
      state.cells.set(marker, change.cell);
      return null;
    case 'removeMarker':
      if (!present) return { path: 'marker', message: `marker "${marker}" is not on the Area in the previous Step` };
      state.cells.delete(marker);
      state.moves.delete(marker);
      return null;
    case 'placeMarker':
      if (!present) return { path: 'marker', message: `marker "${marker}" is not on the Area in the previous Step` };
      state.cells.set(marker, change.cell);
      return null;
    case 'setMove':
      if (!present) return { path: 'marker', message: `marker "${marker}" is not on the Area in the previous Step` };
      state.moves.set(marker, { marker, waypoints: change.waypoints });
      return null;
    case 'removeMove':
      if (!state.moves.has(marker)) return { path: 'marker', message: `marker "${marker}" has no move in the previous Step` };
      state.moves.delete(marker);
      return null;
  }
}

function changeCells(change: Change): Array<{ cell: Cell; path: string }> {
  switch (change.type) {
    case 'addMarker':
    case 'placeMarker':
      return [{ cell: change.cell, path: 'cell' }];
    case 'setMove':
      return change.waypoints.map((cell, j) => ({ cell, path: `waypoints[${j}]` }));
    default:
      return [];
  }
}

function checkReferences(script: PracticeScript): ValidationError[] {
  const errors: ValidationError[] = [];
  const ids = new Set<string>();

  script.markers.forEach((marker, i) => {
    if (ids.has(marker.id)) {
      errors.push({ path: `markers[${i}].id`, message: `duplicate marker id "${marker.id}"` });
    }
    ids.add(marker.id);
  });

  const state: StepState = { cells: new Map(), moves: new Map() };
  const everPlaced = new Set<string>();

  script.base.placements.forEach((placement, i) => {
    const path = `base.placements[${i}]`;
    if (!ids.has(placement.marker)) {
      errors.push({ path: `${path}.marker`, message: `no marker with id "${placement.marker}"` });
    } else if (state.cells.has(placement.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${placement.marker}" is placed more than once` });
    } else {
      state.cells.set(placement.marker, placement.cell);
      everPlaced.add(placement.marker);
    }
    checkCell(placement.cell, script.area, `${path}.cell`, errors);
  });

  script.base.moves.forEach((move, i) => {
    const path = `base.moves[${i}]`;
    if (!ids.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `no marker with id "${move.marker}"` });
    } else if (!state.cells.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${move.marker}" is not placed in the base Step` });
    } else if (state.moves.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${move.marker}" already has a move` });
    } else {
      state.moves.set(move.marker, move);
    }
    move.waypoints.forEach((cell, j) => checkCell(cell, script.area, `${path}.waypoints[${j}]`, errors));
  });

  script.progressions.forEach((progression, p) => {
    progression.changes.forEach((change, c) => {
      const path = `progressions[${p}].changes[${c}]`;
      if (!ids.has(change.marker)) {
        errors.push({ path: `${path}.marker`, message: `no marker with id "${change.marker}"` });
      } else {
        const error = applyChange(state, change);
        if (error) errors.push({ path: `${path}.${error.path}`, message: error.message });
        else if (change.type === 'addMarker') everPlaced.add(change.marker);
      }
      for (const { cell, path: cellPath } of changeCells(change)) {
        checkCell(cell, script.area, `${path}.${cellPath}`, errors);
      }
    });
  });

  script.markers.forEach((marker, i) => {
    if (!everPlaced.has(marker.id)) {
      errors.push({
        path: `markers[${i}]`,
        message: `marker "${marker.id}" is never on the Area: place it in base.placements or add it in a Progression`,
      });
    }
  });

  return errors;
}

/**
 * Check a Practice Script. Accepts the parsed object or the raw JSON text
 * (as pasted into the Import box).
 */
export function validate(input: unknown): ValidationResult {
  let data = input;

  if (typeof input === 'string') {
    if (byteLength(input) > MAX_SCRIPT_BYTES) {
      return { ok: false, errors: [{ path: '', message: `script is too large: the limit is ${MAX_SCRIPT_BYTES} bytes` }] };
    }
    try {
      data = JSON.parse(input);
    } catch (e) {
      return { ok: false, errors: [{ path: '', message: `not valid JSON (${(e as Error).message})` }] };
    }
  } else {
    let text: string | undefined;
    try {
      text = JSON.stringify(input);
    } catch {
      return { ok: false, errors: [{ path: '', message: 'script cannot be converted to JSON' }] };
    }
    if (text !== undefined && byteLength(text) > MAX_SCRIPT_BYTES) {
      return { ok: false, errors: [{ path: '', message: `script is too large: the limit is ${MAX_SCRIPT_BYTES} bytes` }] };
    }
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, errors: [{ path: '', message: 'script must be a JSON object' }] };
  }

  const version = (data as Record<string, unknown>).schemaVersion;
  if (version !== SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [{
        path: 'schemaVersion',
        message: version === undefined
          ? `is required; this app reads schemaVersion ${SCHEMA_VERSION}`
          : `unsupported schemaVersion ${JSON.stringify(version)}; this app reads schemaVersion ${SCHEMA_VERSION}`,
      }],
    };
  }

  const parsed = PracticeScriptSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => ({
        path: formatPath(issue.path),
        message: issueMessage(issue as Issue, data),
      })),
    };
  }

  const errors = checkReferences(parsed.data);
  return errors.length > 0 ? { ok: false, errors } : { ok: true, script: parsed.data };
}

/** Number of Steps in the script: the base plus every Progression. */
export function stepCount(script: PracticeScript): number {
  return 1 + script.progressions.length;
}

/**
 * Full state of Step n of a validated script: the base with Progressions 1..n
 * applied in order, so an edit to an earlier Step carries forward.
 */
export function resolveStep(script: PracticeScript, n: number): ResolvedStep {
  if (!Number.isInteger(n) || n < 0 || n >= stepCount(script)) {
    throw new RangeError(`Step ${n} does not exist; this Practice has ${stepCount(script)} Step(s)`);
  }
  const state: StepState = {
    cells: new Map(script.base.placements.map((p) => [p.marker, p.cell])),
    moves: new Map(script.base.moves.map((m) => [m.marker, m])),
  };
  for (const progression of script.progressions.slice(0, n)) {
    for (const change of progression.changes) {
      const error = applyChange(state, change);
      if (error) throw new Error(`Script is not valid: ${error.message}; run validate() first`);
    }
  }
  const markers = script.markers
    .filter((marker) => state.cells.has(marker.id))
    .map((marker) => ({ ...marker, cell: state.cells.get(marker.id)! }));
  const progression = n > 0 ? script.progressions[n - 1] : undefined;
  return {
    index: n,
    area: script.area,
    markers,
    moves: markers.flatMap((marker) => state.moves.get(marker.id) ?? []),
    lever: progression?.lever,
    commentary: progression ? progression.commentary : script.base.commentary,
  };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function moveDuration(start: Point, move: Move): number {
  let cells = 0;
  let from = start;
  for (const to of move.waypoints) {
    cells += distance(from, to);
    from = to;
  }
  return (cells * CELL_SIZE_M) / PACE_SPEEDS_MPS[DEFAULT_PACE];
}

/** Position along a move after `elapsed` seconds at the default Pace. */
function pointAlong(start: Point, move: Move, elapsed: number): Point {
  let remaining = (elapsed * PACE_SPEEDS_MPS[DEFAULT_PACE]) / CELL_SIZE_M;
  let from = start;
  for (const to of move.waypoints) {
    const leg = distance(from, to);
    if (remaining <= leg) {
      const f = leg === 0 ? 1 : remaining / leg;
      return { x: from.x + (to.x - from.x) * f, y: from.y + (to.y - from.y) * f };
    }
    remaining -= leg;
    from = to;
  }
  return { x: from.x, y: from.y };
}

/** Every marker's position at `t` seconds into the Step, plus the Step's duration. */
export function positionsAt(step: ResolvedStep, t: number): StepPositions {
  const moves = new Map(step.moves.map((m) => [m.marker, m]));
  let duration = 0;
  const positions: Record<string, Point> = {};

  for (const marker of step.markers) {
    const start = { x: marker.cell.x, y: marker.cell.y };
    const move = moves.get(marker.id);
    if (!move) {
      positions[marker.id] = start;
      continue;
    }
    duration = Math.max(duration, moveDuration(start, move));
    positions[marker.id] = pointAlong(start, move, Math.max(0, t));
  }

  return { duration, positions };
}
