/**
 * Practice Script engine. Pure: no React, DOM or database.
 *
 * Every consumer (editor, share view, Import, thumbnails) goes through:
 * - validate(script)       -> the script, or path-specific plain-language errors
 * - resolveStep(script, n) -> full state of Step n
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
  markers: ResolvedMarker[];
  moves: Move[];
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
  if (issue.code === 'invalid_type' && valueAt(input, issue.path) === undefined) {
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

function checkReferences(script: PracticeScript): ValidationError[] {
  const errors: ValidationError[] = [];
  const ids = new Set<string>();

  script.markers.forEach((marker, i) => {
    if (ids.has(marker.id)) {
      errors.push({ path: `markers[${i}].id`, message: `duplicate marker id "${marker.id}"` });
    }
    ids.add(marker.id);
  });

  const placed = new Set<string>();
  script.base.placements.forEach((placement, i) => {
    const path = `base.placements[${i}]`;
    if (!ids.has(placement.marker)) {
      errors.push({ path: `${path}.marker`, message: `no marker with id "${placement.marker}"` });
    } else if (placed.has(placement.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${placement.marker}" is placed more than once` });
    }
    placed.add(placement.marker);
    checkCell(placement.cell, script.area, `${path}.cell`, errors);
  });

  script.markers.forEach((marker, i) => {
    if (!placed.has(marker.id)) {
      errors.push({ path: `markers[${i}]`, message: `marker "${marker.id}" has no placement in base.placements` });
    }
  });

  const moved = new Set<string>();
  script.base.moves.forEach((move, i) => {
    const path = `base.moves[${i}]`;
    if (!ids.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `no marker with id "${move.marker}"` });
    } else if (moved.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${move.marker}" already has a move` });
    }
    moved.add(move.marker);
    move.waypoints.forEach((cell, j) => checkCell(cell, script.area, `${path}.waypoints[${j}]`, errors));
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

/** Number of Steps in the script. Only the base Step exists in schema v1. */
export function stepCount(_script: PracticeScript): number {
  return 1;
}

/** Full state of Step n of a validated script. */
export function resolveStep(script: PracticeScript, n: number): ResolvedStep {
  if (!Number.isInteger(n) || n < 0 || n >= stepCount(script)) {
    throw new RangeError(`Step ${n} does not exist; this Practice has ${stepCount(script)} Step(s)`);
  }
  const cells = new Map(script.base.placements.map((p) => [p.marker, p.cell]));
  return {
    index: 0,
    area: script.area,
    markers: script.markers.map((marker) => ({ ...marker, cell: cells.get(marker.id)! })),
    moves: script.base.moves,
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
