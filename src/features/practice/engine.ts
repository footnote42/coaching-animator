/**
 * Practice Script engine. Pure: no React, DOM or database.
 *
 * Every consumer (editor, share view, Import, thumbnails) goes through:
 * - validate(script)       -> the script, or path-specific plain-language errors
 * - stepCount(script)      -> number of Steps (base plus Progressions)
 * - resolveStep(script, n) -> full state of Step n, with the Progression chain applied
 * - positionsAt(step, t)   -> every marker's position at t seconds, plus the Step's duration and pass flights
 *
 * Positions are in cell units: { x: 3, y: 4 } is the centre of cell (3, 4).
 */
import {
  BALL_CARRIER_KINDS,
  CELL_SIZE_M,
  LYING_KINDS,
  MAX_BALLS,
  PracticeScriptSchema,
  SCHEMA_VERSION,
  type Area,
  type Cell,
  type Change,
  type Commentary,
  type Direction,
  type Lever,
  type Marker,
  type MarkerKind,
  type Move,
  type Pace,
  type Pass,
  type PracticeScript,
} from './schema';

export type { Pace };

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
} as const satisfies Record<Pace, number>;

export const DEFAULT_PACE: Pace = 'jog';

/**
 * How hard a Run speeds up from a standstill to its Pace, in metres per second
 * squared: a jog reaches Pace in 1 s, a sprint in 2 s. Tune by eye, like the Paces.
 */
export const RUN_ACCELERATION_MPS2 = 2;
/**
 * How hard a Run slows into its last waypoint, in metres per second squared.
 * Gentler than the acceleration so players ease off rather than brake. Tune by eye.
 */
export const RUN_TAPER_MPS2 = 1.5;

/** Speed of the ball on a pass, in metres per second. Also slower than real time. */
export const PASS_SPEED_MPS = 8;
/** Speed of the ball on a kick, in metres per second: half a pass, as a kick hangs in the air. */
export const KICK_SPEED_MPS = 4;
/**
 * How far a ball kicked to space rolls on after it lands, in metres, in the
 * direction of the kick (stopping at the edge of the Area). Tune by eye.
 */
export const KICK_ROLL_M = 2;
/** Seconds the roll takes, slowing evenly to a stop. Tune by eye with the distance. */
export const KICK_ROLL_S = 1.5;

export interface ValidationError {
  /** Field path, e.g. `base.moves[2].marker`. Empty string means the whole script. */
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; script: PracticeScript }
  | { ok: false; errors: ValidationError[] };

/** A problem that does not stop a script being saved or played. */
export interface ValidationWarning {
  /** Index of the Step the warning is about (0 is the base Step). */
  step: number;
  /** Id of the pass concerned. */
  pass: string;
  /** `forward`: caught ahead of the thrower. `early`: the receiver reaches the catch point before the passer has the ball. */
  kind: 'forward' | 'early';
  message: string;
  /** For `early`: starting the receiver's Run after this earlier pass of the ball clears it. */
  fix?: { marker: string; afterPass: string };
}

export interface ResolvedMarker extends Marker {
  /** Starting cell. For the ball, the starting cell of its holder, or the cell it lies loose on. */
  cell: Cell;
  /** For the ball: the marker holding it at the start of the Step. Left out for a ball that starts loose. */
  holder?: string;
  /** True when the kit lies flat for the whole Step. Left out when upright. */
  lying?: true;
}

export interface ResolvedStep {
  index: number;
  area: Area;
  /** Markers on the Area in this Step, in the order the script declares them. */
  markers: ResolvedMarker[];
  moves: Move[];
  /** Passes in the order they happen. */
  passes: Pass[];
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
  /** Every pass in the order it happens, with when and where the ball flies. */
  passes: PassFlight[];
}

export interface PassFlight {
  id: string;
  /** Id of the ball being passed. */
  ball: string;
  from: string;
  /** The receiver. Left out for a Kick to space, after which the ball lies loose. */
  to?: string;
  /** Where the ball leaves the passer, in cell units. */
  start: Point;
  /** Where the ball is caught: the receiver's cell, or a point on its run for a catch on the run. For a Kick to space, where it lands. */
  end: Point;
  /** True when the pass is a kick: slower, arched in flight, never forward. */
  kick?: boolean;
  /** Seconds into the Step the pass is thrown. */
  fire: number;
  /** Seconds into the Step the pass is caught, or for a Kick to space lands. */
  land: number;
  /** Kick to space only: after landing the ball rolls on to `to`, resting there loose from `until` seconds. */
  roll?: { to: Point; until: number };
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

function areaOf({ template, width, length }: Area): Area {
  return template === undefined ? { width, length } : { template, width, length };
}

/** Markers on the Area at one Step, keyed by marker id; passes keyed by pass id, in play order. */
interface StepState {
  area: Area;
  /** Starting cell of every marker on the Area except the ball. */
  cells: Map<string, Cell>;
  /** Who holds the ball at the start of the Step, keyed by ball id. */
  holders: Map<string, string>;
  /** Cell each ball that starts loose lies on, keyed by ball id. */
  loose: Map<string, Cell>;
  /** Kit lying flat in this Step. */
  lying: Set<string>;
  moves: Map<string, Move>;
  passes: Map<string, Pass>;
}

function emptyState(area: Area): StepState {
  return { area, cells: new Map(), holders: new Map(), loose: new Map(), lying: new Set(), moves: new Map(), passes: new Map() };
}

const canLie = (kind: MarkerKind | undefined) => kind !== undefined && (LYING_KINDS as readonly string[]).includes(kind);
const LYING_KIND_NAMES = LYING_KINDS.map((kind) => `a ${kind.replace('-', ' ')}`).join(' or ');

function onArea(state: StepState, marker: string): boolean {
  return state.cells.has(marker) || state.holders.has(marker) || state.loose.has(marker);
}

/**
 * Set where a marker starts: the ball takes a holder or a cell to lie loose
 * on, every other marker a cell. The start is replaced whole, so kit given no `lying` stands upright.
 * Lying on a kind that cannot lie is reported after the marker is placed, so
 * it does not also show up as a marker missing from the Area.
 */
function setStart(
  state: StepState,
  marker: string,
  start: { cell?: Cell; holder?: string; lying?: boolean },
  kind: MarkerKind | undefined,
): ValidationError | null {
  if (kind === 'ball') {
    if (start.cell && start.holder !== undefined) {
      return { path: 'cell', message: 'give "holder" (the marker carrying the ball) or "cell" (where it lies loose), not both' };
    }
    if (start.cell) {
      state.holders.delete(marker);
      state.loose.set(marker, start.cell);
    } else if (start.holder !== undefined) {
      state.loose.delete(marker);
      state.holders.set(marker, start.holder);
    } else {
      return { path: 'holder', message: 'is required: the id of the marker carrying the ball, or give "cell" for a ball lying loose' };
    }
  } else {
    if (start.holder !== undefined) return { path: 'holder', message: 'only the ball has a holder' };
    if (!start.cell) return { path: 'cell', message: 'is required' };
    state.cells.set(marker, start.cell);
  }
  if (start.lying !== undefined && !canLie(kind)) {
    return { path: 'lying', message: `only ${LYING_KIND_NAMES} can be Lying; marker "${marker}" is a ${kind}` };
  }
  if (start.lying) state.lying.add(marker);
  else state.lying.delete(marker);
  return null;
}

/**
 * Apply one change to `state` in place. Returns an error (with a path relative
 * to the change) and leaves `state` untouched if the change does not fit.
 */
function applyChange(state: StepState, change: Change, kindOf: (id: string) => MarkerKind | undefined): ValidationError | null {
  if (change.type === 'setPass') {
    const { type: _type, ...pass } = change;
    void _type;
    state.passes.set(change.id, pass);
    return null;
  }
  if (change.type === 'removePass') {
    if (!state.passes.has(change.id)) return { path: 'id', message: `no pass "${change.id}" in the previous Step` };
    state.passes.delete(change.id);
    return null;
  }
  if (change.type === 'setArea') {
    state.area = areaOf(change);
    return null;
  }
  const { marker } = change;
  const present = onArea(state, marker);
  switch (change.type) {
    case 'addMarker':
      if (present) return { path: 'marker', message: `marker "${marker}" is already on the Area in the previous Step` };
      return setStart(state, marker, change, kindOf(marker));
    case 'removeMarker':
      if (!present) return { path: 'marker', message: `marker "${marker}" is not on the Area in the previous Step` };
      state.cells.delete(marker);
      state.holders.delete(marker);
      state.loose.delete(marker);
      state.lying.delete(marker);
      state.moves.delete(marker);
      return null;
    case 'placeMarker':
      if (!present) return { path: 'marker', message: `marker "${marker}" is not on the Area in the previous Step` };
      return setStart(state, marker, change, kindOf(marker));
    case 'setMove':
      if (!present) return { path: 'marker', message: `marker "${marker}" is not on the Area in the previous Step` };
      state.moves.set(marker, { marker, waypoints: change.waypoints, pace: change.pace, after: change.after });
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
      return change.cell ? [{ cell: change.cell, path: 'cell' }] : [];
    case 'setMove':
      return change.waypoints.map((cell, j) => ({ cell, path: `waypoints[${j}]` }));
    case 'setPass':
      return change.cell ? [{ cell: change.cell, path: 'cell' }] : [];
    default:
      return [];
  }
}

/** A pass with the ball it moves settled: a pass that names no ball moves the default ball. */
type BallPass = Pass & { ball: string };

/**
 * What waits for what, as a graph of `move:<marker>` and `pass:<id>` nodes.
 * A move waits for its `after`. A pass waits for the previous pass of the same
 * ball to be caught and for the receiver's move (to finish, or reach the catch
 * waypoint). The exception is a receiver whose move waits on this very pass,
 * directly or not: it has not set off, so the pass does not wait for it and is
 * caught on its starting cell. Those passes are returned in `inPlace`.
 */
function waitEdges(moves: Map<string, Move>, passes: BallPass[]) {
  const edges = new Map<string, string[]>();
  for (const [marker, { after }] of moves) {
    edges.set(
      `move:${marker}`,
      after?.move !== undefined ? [`move:${after.move}`] : after?.pass !== undefined ? [`pass:${after.pass}`] : [],
    );
  }
  const lastOfBall = new Map<string, string>();
  for (const pass of passes) {
    const previous = lastOfBall.get(pass.ball);
    edges.set(`pass:${pass.id}`, previous === undefined ? [] : [`pass:${previous}`]);
    lastOfBall.set(pass.ball, pass.id);
  }
  for (const pass of passes) {
    if (pass.after) edges.get(`pass:${pass.id}`)!.push(`move:${pass.after.move}`);
  }
  for (const pass of passes) {
    if (pass.to !== undefined && moves.has(pass.to)) edges.get(`pass:${pass.id}`)!.push(`move:${pass.to}`);
  }
  // A receiver that waits on its own pass, directly or not, would make a loop.
  const inPlace = new Set<string>();
  for (const pass of passes) {
    if (pass.to !== undefined && moves.has(pass.to) && waitsOn(edges, `move:${pass.to}`, new Set([`pass:${pass.id}`]))) inPlace.add(pass.id);
  }
  for (const id of inPlace) {
    const waits = edges.get(`pass:${id}`)!;
    waits.splice(waits.length - 1, 1);
  }
  return { edges, inPlace };
}

/** A loop of waits, as the nodes around it (first repeated at the end), or null. */
function findLoop(edges: Map<string, string[]>): string[] | null {
  const done = new Set<string>();
  const stack: string[] = [];
  const visit = (node: string): string[] | null => {
    if (done.has(node)) return null;
    if (stack.includes(node)) return [...stack.slice(stack.indexOf(node)), node];
    stack.push(node);
    for (const next of edges.get(node) ?? []) {
      const loop = visit(next);
      if (loop) return loop;
    }
    stack.pop();
    done.add(node);
    return null;
  };
  for (const node of edges.keys()) {
    const loop = visit(node);
    if (loop) return loop;
  }
  return null;
}

/** Whether `from` waits, directly or not, on any node in `targets`. */
function waitsOn(edges: Map<string, string[]>, from: string, targets: Set<string>): boolean {
  const seen = new Set<string>();
  const queue = [...(edges.get(from) ?? [])];
  while (queue.length > 0) {
    const node = queue.pop()!;
    if (targets.has(node)) return true;
    if (seen.has(node)) continue;
    seen.add(node);
    queue.push(...(edges.get(node) ?? []));
  }
  return false;
}

/** Something in a Step that a whole-Step check can fault. */
interface Target {
  kind: 'ball' | 'move' | 'pass';
  /** Ball or moving marker id, or pass id. */
  id: string;
}

interface StepIssue {
  target: Target;
  /** Field within the placement, move, pass or change, e.g. `from`. */
  field: string;
  message: string;
}

function splitNode(node: string): Target {
  const at = node.indexOf(':');
  return { kind: node.slice(0, at) as Target['kind'], id: node.slice(at + 1) };
}

function targetLabel({ kind, id }: Target): string {
  return kind === 'move' ? `the move of "${id}"` : `${kind} "${id}"`;
}

/** Checks that need the whole Step: ball holders, passes in order, move waits and loops. */
function checkStep(state: StepState, kinds: Map<string, MarkerKind>): StepIssue[] {
  const issues: StepIssue[] = [];
  const checkCarrier = (target: Target, field: string, id: string) => {
    const kind = kinds.get(id);
    if (kind === undefined) issues.push({ target, field, message: `no marker with id "${id}"` });
    else if (!onArea(state, id)) issues.push({ target, field, message: `marker "${id}" is not on the Area in this Step` });
    else if (!(BALL_CARRIER_KINDS as readonly string[]).includes(kind)) {
      issues.push({ target, field, message: `marker "${id}" is a ${kind}; only attackers, defenders and coaches handle the ball` });
    }
  };

  // The ball a pass moves when it names none: the first ball the script declares.
  const defaultBall = [...kinds].find(([, kind]) => kind === 'ball')?.[0];
  const holders = new Map<string, string>();
  for (const [ball, ballHolder] of state.holders) {
    const target: Target = { kind: 'ball', id: ball };
    checkCarrier(target, 'holder', ballHolder);
    const other = [...holders].find(([, h]) => h === ballHolder)?.[0];
    if (other !== undefined) {
      issues.push({ target, field: 'holder', message: `marker "${ballHolder}" already holds ball "${other}"; a player cannot hold two balls at once` });
    }
    holders.set(ball, ballHolder);
  }
  /** Why each ball nobody holds is loose, for messages: it started loose, or was kicked to space. */
  const looseBy = new Map<string, string>();
  for (const [ball, cell] of state.loose) looseBy.set(ball, `lies loose on cell (${cell.x}, ${cell.y})`);

  for (const [marker, { after }] of state.moves) {
    const target: Target = { kind: 'move', id: marker };
    if (kinds.get(marker) === 'ball') {
      issues.push({ target, field: 'marker', message: 'the ball does not run on its own; it moves with its holder or on a pass' });
    }
    if (!after) continue;
    if ((after.move === undefined) === (after.pass === undefined)) {
      issues.push({ target, field: 'after', message: 'give exactly one of "move" or "pass"' });
    } else if (after.move !== undefined && !state.moves.has(after.move)) {
      issues.push({ target, field: 'after.move', message: `marker "${after.move}" has no move in this Step` });
    } else if (after.pass !== undefined && !state.passes.has(after.pass)) {
      issues.push({ target, field: 'after.pass', message: `no pass "${after.pass}" in this Step` });
    }
  }

  for (const pass of state.passes.values()) {
    const target: Target = { kind: 'pass', id: pass.id };
    if (state.holders.size === 0 && state.loose.size === 0) {
      issues.push({ target, field: 'from', message: 'there is no ball on the Area in this Step' });
      break;
    }
    checkCarrier(target, 'from', pass.from);
    if (pass.to !== undefined) checkCarrier(target, 'to', pass.to);
    if ((pass.to === undefined) === (pass.cell === undefined)) {
      issues.push({ target, field: 'to', message: 'give exactly one of "to" (the receiver) or "cell" (a Kick to space)' });
    } else if (pass.cell && !pass.kick) {
      issues.push({ target, field: 'cell', message: 'only a kick goes to space; add "kick": true, or give "to" for a pass to a receiver' });
    } else if (pass.cell && pass.at !== undefined) {
      issues.push({ target, field: 'at', message: 'a Kick to space has no receiver to catch on the run; leave out "at"' });
    }
    const ball = pass.ball ?? defaultBall;
    const holder = ball === undefined ? undefined : holders.get(ball);
    const loose = ball === undefined ? undefined : looseBy.get(ball);
    if (ball !== undefined && holder === undefined && loose !== undefined) {
      const which = state.holders.size + state.loose.size > 1 ? `ball "${ball}"` : 'the ball';
      issues.push({ target, field: 'from', message: `${which} ${loose}, so nobody holds it to pass when this pass fires` });
      continue;
    }
    if (ball === undefined || holder === undefined) {
      issues.push({
        target,
        field: 'ball',
        message:
          pass.ball !== undefined && kinds.get(pass.ball) !== 'ball'
            ? `marker "${pass.ball}" is not a ball`
            : `ball "${ball}" is not on the Area in this Step; name the ball being passed`,
      });
      continue;
    }
    if (pass.from === pass.to) {
      issues.push({ target, field: 'to', message: 'a marker cannot pass to itself' });
    } else if (pass.from !== holder) {
      const which = state.holders.size + state.loose.size > 1 ? `ball "${ball}"` : 'the ball';
      issues.push({ target, field: 'from', message: `marker "${pass.from}" does not hold ${which} when this pass fires; "${holder}" does` });
    }
    if (pass.to === undefined) {
      holders.delete(ball);
      looseBy.set(ball, `lies loose after the Kick to space "${pass.id}"`);
    } else {
      holders.set(ball, pass.to);
    }
    if (pass.after && !state.moves.has(pass.after.move)) {
      issues.push({ target, field: 'after.move', message: `marker "${pass.after.move}" has no move in this Step` });
    }
    if (pass.at !== undefined && pass.to !== undefined) {
      const move = state.moves.get(pass.to);
      if (!move) {
        issues.push({ target, field: 'at', message: `marker "${pass.to}" has no move in this Step, so there is nothing to catch on the run; leave out "at" or give "${pass.to}" a move` });
      } else if (pass.at >= move.waypoints.length) {
        const count = move.waypoints.length;
        issues.push({ target, field: 'at', message: `waypoint ${pass.at} is outside the move of "${pass.to}", which has ${count} waypoint${count > 1 ? 's' : ''} (${count > 1 ? `0-${count - 1}` : '0'})` });
      }
    }
  }

  if (issues.length === 0) {
    const passes = [...state.passes.values()].map((pass): BallPass => ({ ...pass, ball: pass.ball ?? defaultBall! }));
    const moves = [...state.moves.values()];
    const { edges, inPlace } = waitEdges(state.moves, passes);
    const loop = findLoop(edges);
    if (loop) {
      const [first, ...rest] = loop.map(splitNode);
      issues.push({
        target: first,
        field: first.kind === 'move' ? 'after' : 'to',
        message: `moves and passes wait on each other in a loop: ${targetLabel(first)} waits for ${rest.map(targetLabel).join(', which waits for ')}`,
      });
    } else {
      for (const pass of passes) {
        if (inPlace.has(pass.id) && pass.at !== undefined) {
          issues.push({
            target: { kind: 'pass', id: pass.id },
            field: 'at',
            message: `the move of "${pass.to}" waits for this pass, so it is caught on the cell "${pass.to}" starts on; leave out "at"`,
          });
        }
      }
      if (issues.length === 0 && state.holders.size > 1) {
        const { flights } = timeline(state.cells, moves, passes, state.area);
        const twice = heldTwice(flights, state.holders);
        if (twice) issues.push(twice);
      }
    }
  }
  return issues;
}

function checkReferences(script: PracticeScript): ValidationError[] {
  const errors: ValidationError[] = [];
  const kinds = new Map<string, MarkerKind>();
  let balls = 0;

  script.markers.forEach((marker, i) => {
    if (kinds.has(marker.id)) {
      errors.push({ path: `markers[${i}].id`, message: `duplicate marker id "${marker.id}"` });
    } else {
      kinds.set(marker.id, marker.kind);
    }
    if (marker.colour !== undefined && marker.kind !== 'cone') {
      errors.push({ path: `markers[${i}].colour`, message: `only a cone has a colour; marker "${marker.id}" is a ${marker.kind}` });
    }
    if (marker.kind === 'ball') {
      balls += 1;
      if (balls > MAX_BALLS) errors.push({ path: `markers[${i}].kind`, message: `a Practice has at most ${MAX_BALLS} balls` });
    }
  });
  const kindOf = (id: string) => kinds.get(id);

  // Whole-Step problems carry forward to later Steps; report each one once.
  const reported = new Set<string>();
  const report = (issues: StepIssue[], locate: (target: Target) => string | undefined, fallback: string) => {
    for (const { target, field, message } of issues) {
      const key = `${targetLabel(target)}|${field}|${message}`;
      if (reported.has(key)) continue;
      reported.add(key);
      const at = locate(target);
      errors.push(at ? { path: `${at}.${field}`, message } : { path: fallback, message: `${targetLabel(target)}: ${message}` });
    }
  };

  const state = emptyState(script.area);
  const everPlaced = new Set<string>();

  script.base.placements.forEach((placement, i) => {
    const path = `base.placements[${i}]`;
    if (!kinds.has(placement.marker)) {
      errors.push({ path: `${path}.marker`, message: `no marker with id "${placement.marker}"` });
    } else if (onArea(state, placement.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${placement.marker}" is placed more than once` });
    } else {
      const error = setStart(state, placement.marker, placement, kindOf(placement.marker));
      if (error) errors.push({ path: `${path}.${error.path}`, message: error.message });
      if (onArea(state, placement.marker)) everPlaced.add(placement.marker);
    }
    if (placement.cell) checkCell(placement.cell, script.area, `${path}.cell`, errors);
  });

  script.base.moves.forEach((move, i) => {
    const path = `base.moves[${i}]`;
    if (!kinds.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `no marker with id "${move.marker}"` });
    } else if (!onArea(state, move.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${move.marker}" is not placed in the base Step` });
    } else if (state.moves.has(move.marker)) {
      errors.push({ path: `${path}.marker`, message: `marker "${move.marker}" already has a move` });
    } else {
      state.moves.set(move.marker, move);
    }
    move.waypoints.forEach((cell, j) => checkCell(cell, script.area, `${path}.waypoints[${j}]`, errors));
  });

  script.base.passes.forEach((pass, i) => {
    if (state.passes.has(pass.id)) {
      errors.push({ path: `base.passes[${i}].id`, message: `duplicate pass id "${pass.id}"` });
    } else {
      state.passes.set(pass.id, pass);
    }
    if (pass.cell) checkCell(pass.cell, script.area, `base.passes[${i}].cell`, errors);
  });

  report(
    checkStep(state, kinds),
    ({ kind, id }) => {
      const [list, i] =
        kind === 'pass' ? ['passes', script.base.passes.findIndex((p) => p.id === id)]
        : kind === 'move' ? ['moves', script.base.moves.findIndex((m) => m.marker === id)]
        : ['placements', script.base.placements.findIndex((p) => p.marker === id)];
      return i < 0 ? undefined : `base.${list}[${i}]`;
    },
    'base',
  );

  script.progressions.forEach((progression, p) => {
    // A Step has one Area: the last setArea in its Progression, or the previous Step's.
    let resized: number | undefined;
    progression.changes.forEach((change, c) => {
      if (change.type === 'setArea') resized = c;
    });
    const resize = resized === undefined ? undefined : progression.changes[resized];
    const area = resize?.type === 'setArea' ? areaOf(resize) : state.area;
    const set = new Set<string>();
    progression.changes.forEach((change, c) => {
      const path = `progressions[${p}].changes[${c}]`;
      if (change.type === 'setArea' && progression.lever !== 'space') {
        errors.push({ path: `${path}.type`, message: 'only a Progression that pulls the Space lever can change the Area' });
      }
      if (change.type === 'addMarker' || change.type === 'placeMarker') set.add(`cell:${change.marker}`);
      if (change.type === 'setMove') set.add(`move:${change.marker}`);
      if (change.type === 'setPass') set.add(`pass:${change.id}`);
      if ('marker' in change && !kinds.has(change.marker)) {
        errors.push({ path: `${path}.marker`, message: `no marker with id "${change.marker}"` });
      } else {
        const error = applyChange(state, change, kindOf);
        if (error) errors.push({ path: `${path}.${error.path}`, message: error.message });
        if (change.type === 'addMarker' && onArea(state, change.marker)) everPlaced.add(change.marker);
      }
      for (const { cell, path: cellPath } of changeCells(change)) {
        checkCell(cell, area, `${path}.${cellPath}`, errors);
      }
    });

    // Cells carried forward from the previous Step must fit a resized Area too.
    if (resized !== undefined) {
      const path = `progressions[${p}].changes[${resized}]`;
      const outside = (cell: Cell) => cell.x >= area.width || cell.y >= area.length;
      for (const [marker, cell] of [...state.cells, ...state.loose]) {
        if (!set.has(`cell:${marker}`) && outside(cell)) {
          errors.push({ path, message: `marker "${marker}" starts on cell (${cell.x}, ${cell.y}), outside the new ${area.width} x ${area.length} m Area; move or remove it in this Progression` });
        }
      }
      for (const [marker, move] of state.moves) {
        const cell = set.has(`move:${marker}`) ? undefined : move.waypoints.find(outside);
        if (cell) {
          errors.push({ path, message: `the move of "${marker}" runs to cell (${cell.x}, ${cell.y}), outside the new ${area.width} x ${area.length} m Area; change or remove it in this Progression` });
        }
      }
      for (const [id, pass] of state.passes) {
        if (pass.cell && !set.has(`pass:${id}`) && outside(pass.cell)) {
          errors.push({ path, message: `pass "${id}" is kicked to cell (${pass.cell.x}, ${pass.cell.y}), outside the new ${area.width} x ${area.length} m Area; change or remove it in this Progression` });
        }
      }
    }

    const touches = (change: Change, { kind, id }: Target) =>
      kind === 'pass'
        ? change.type === 'setPass' && change.id === id
        : kind === 'move'
          ? change.type === 'setMove' && change.marker === id
          : (change.type === 'addMarker' || change.type === 'placeMarker') && change.marker === id;
    report(
      checkStep(state, kinds),
      (target) => {
        const c = progression.changes.map((change) => touches(change, target)).lastIndexOf(true);
        return c < 0 ? undefined : `progressions[${p}].changes[${c}]`;
      },
      `progressions[${p}]`,
    );
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
  const kinds = new Map(script.markers.map((m) => [m.id, m.kind]));
  const kindOf = (id: string) => kinds.get(id);
  const state = emptyState(script.area);
  for (const placement of script.base.placements) setStart(state, placement.marker, placement, kindOf(placement.marker));
  for (const move of script.base.moves) state.moves.set(move.marker, move);
  for (const pass of script.base.passes) state.passes.set(pass.id, pass);
  for (const progression of script.progressions.slice(0, n)) {
    for (const change of progression.changes) {
      const error = applyChange(state, change, kindOf);
      if (error) throw new Error(`Script is not valid: ${error.message}; run validate() first`);
    }
  }
  const markers = script.markers
    .filter((marker) => onArea(state, marker.id))
    .map((marker): ResolvedMarker => {
      const holder = state.holders.get(marker.id);
      if (holder !== undefined) return { ...marker, holder, cell: state.cells.get(holder)! };
      const loose = state.loose.get(marker.id);
      if (loose) return { ...marker, cell: loose };
      return { ...marker, cell: state.cells.get(marker.id)!, ...(state.lying.has(marker.id) && { lying: true as const }) };
    });
  const progression = n > 0 ? script.progressions[n - 1] : undefined;
  return {
    index: n,
    area: state.area,
    markers,
    moves: markers.flatMap((marker) => state.moves.get(marker.id) ?? []),
    passes: [...state.passes.values()],
    lever: progression?.lever,
    commentary: progression ? progression.commentary : script.base.commentary,
  };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * How far along its path a Run has travelled over time: the one place a Run's
 * speed is decided. Distances are in cells along the path, times in seconds
 * from the Run's start. `distanceAt` may run past the path, where the Run
 * rests at its last waypoint.
 */
interface SpeedProfile {
  /** Seconds the whole Run takes. */
  duration: number;
  /** Cells travelled `elapsed` seconds after the Run starts. */
  distanceAt(elapsed: number): number;
  /** Seconds after the Run starts at which it has travelled `cells`. */
  timeAt(cells: number): number;
}

/**
 * A Run that accelerates from rest to its Pace, holds it, and tapers to a stop
 * exactly on its last waypoint. A Run too short to reach its Pace peaks below it.
 */
function easedProfile(length: number, speedMps: number): SpeedProfile {
  const metres = length * CELL_SIZE_M;
  if (metres <= 0) return { duration: 0, distanceAt: () => 0, timeAt: () => 0 };
  const a = RUN_ACCELERATION_MPS2;
  const d = RUN_TAPER_MPS2;
  // Speeding up and tapering cover v^2/2a and v^2/2d; on a short Run they meet at the peak.
  const peak = Math.min(speedMps, Math.sqrt((2 * metres * a * d) / (a + d)));
  const accelTime = peak / a;
  const accelMetres = (peak * peak) / (2 * a);
  const taperTime = peak / d;
  const taperMetres = (peak * peak) / (2 * d);
  const cruiseMetres = Math.max(0, metres - accelMetres - taperMetres);
  const taperStart = accelTime + cruiseMetres / peak;
  const duration = taperStart + taperTime;

  const metresAt = (elapsed: number): number => {
    if (elapsed <= 0) return 0;
    if (elapsed < accelTime) return 0.5 * a * elapsed * elapsed;
    if (elapsed < taperStart) return accelMetres + peak * (elapsed - accelTime);
    if (elapsed < duration) {
      const left = duration - elapsed;
      return metres - 0.5 * d * left * left;
    }
    return metres;
  };
  const secondsAt = (m: number): number => {
    if (m <= 0) return 0;
    if (m < accelMetres) return Math.sqrt((2 * m) / a);
    if (m < metres - taperMetres) return accelTime + (m - accelMetres) / peak;
    if (m < metres) return duration - Math.sqrt((2 * (metres - m)) / d);
    return duration;
  };
  return {
    duration,
    distanceAt: (elapsed) => metresAt(elapsed) / CELL_SIZE_M,
    timeAt: (cells) => secondsAt(cells * CELL_SIZE_M),
  };
}

/** A profile played `scale` times slower, keeping its shape: easing, Pace and taper all slow together. */
function slowedProfile(profile: SpeedProfile, scale: number): SpeedProfile {
  if (scale === 1) return profile;
  return {
    duration: profile.duration * scale,
    distanceAt: (elapsed) => profile.distanceAt(elapsed / scale),
    timeAt: (cells) => profile.timeAt(cells) * scale,
  };
}

/** A Run's path from its start cell through its waypoints, and how it moves along it. */
interface Run {
  start: Point;
  move: Move;
  /** Cells from the start to each waypoint. */
  reach: number[];
  profile: SpeedProfile;
}

function runOf(start: Point, move: Move): Run {
  const reach: number[] = [];
  let cells = 0;
  let from = start;
  for (const to of move.waypoints) {
    cells += distance(from, to);
    reach.push(cells);
    from = to;
  }
  return { start, move, reach, profile: easedProfile(cells, PACE_SPEEDS_MPS[move.pace ?? DEFAULT_PACE]) };
}

/** Seconds a Run takes from its start to waypoint `upto` (default: the last). */
function runDuration(run: Run, upto?: number): number {
  if (upto === undefined) return run.profile.duration;
  return run.profile.timeAt(run.reach[Math.min(upto, run.reach.length - 1)]);
}

/** Position along a Run `elapsed` seconds after it starts. */
function pointAlong(run: Run, elapsed: number): Point {
  let remaining = run.profile.distanceAt(elapsed);
  let from = run.start;
  for (const to of run.move.waypoints) {
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

/**
 * Where a ball kicked to space from `start` to `end` stops rolling: `KICK_ROLL_M`
 * on in the kick's direction, held inside the Area. A kick with no direction does not roll.
 */
function rollTo(start: Point, end: Point, area: Area): Point {
  const length = distance(start, end);
  if (length === 0) return { x: end.x, y: end.y };
  const cells = KICK_ROLL_M / CELL_SIZE_M;
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return {
    x: clamp(end.x + ((end.x - start.x) / length) * cells, area.width - 1),
    y: clamp(end.y + ((end.y - start.y) / length) * cells, area.length - 1),
  };
}

/** Where a ball rolling after a Kick to space is at `time`: it slows evenly to rest at `roll.to`. */
function rollAt(flight: PassFlight, time: number): Point {
  const { end, roll } = flight;
  if (!roll || time >= roll.until) return roll ? roll.to : end;
  const k = (time - flight.land) / (roll.until - flight.land);
  const f = k * (2 - k);
  return { x: end.x + (roll.to.x - end.x) * f, y: end.y + (roll.to.y - end.y) * f };
}

/**
 * Which pass each receiver's Run is timed to (ADR 0005), as receiver id -> pass
 * index. A Run is timed to the first pass to that receiver in list order. It is
 * left untimed when its move waits on the pass (caught in place) or when timing
 * it would loop: the pass would then wait, through the ball, a Run or where the
 * passer is, on the very Run it times. Decided in list order, so it is deterministic.
 *
 * Nodes: `start:<marker>` is when a Run would start untimed, `move:<marker>` the
 * Run as played, `pass:<id>` a flight. Each lists what it is computed from.
 */
function timedReceivers(moves: Map<string, Move>, passes: BallPass[], edges: Map<string, string[]>, inPlace: Set<string>) {
  const graph = new Map<string, string[]>();
  for (const [marker, { after }] of moves) {
    graph.set(`start:${marker}`, after?.move !== undefined ? [`move:${after.move}`] : after?.pass !== undefined ? [`pass:${after.pass}`] : []);
    graph.set(`move:${marker}`, [`start:${marker}`]);
  }
  const lastOfBall = new Map<string, string>();
  for (const pass of passes) {
    const node = `pass:${pass.id}`;
    const previous = lastOfBall.get(pass.ball);
    const needs = previous === undefined ? [] : [`pass:${previous}`];
    lastOfBall.set(pass.ball, pass.id);
    if (pass.after) needs.push(`move:${pass.after.move}`);
    if (moves.has(pass.from) && !waitsOn(edges, `move:${pass.from}`, new Set([node]))) needs.push(`move:${pass.from}`);
    if (pass.to !== undefined && moves.has(pass.to) && !inPlace.has(pass.id)) needs.push(`move:${pass.to}`);
    graph.set(node, needs);
  }
  const timed = new Map<string, number>();
  passes.forEach((pass, i) => {
    // A Kick to space has no receiver, so it never times a Run.
    if (pass.to === undefined || !moves.has(pass.to) || inPlace.has(pass.id) || timed.has(pass.to)) return;
    const node = `pass:${pass.id}`;
    const needs = graph.get(node)!;
    const to = pass.to;
    const run = graph.get(`move:${to}`)!;
    // Timed, the pass needs only when the receiver would start, and the Run needs the pass.
    const swapped = needs.map((n) => (n === `move:${to}` ? `start:${to}` : n));
    graph.set(node, swapped);
    run.push(node);
    if (waitsOn(graph, node, new Set([node]))) {
      graph.set(node, needs);
      run.pop();
    } else {
      timed.set(to, i);
    }
  });
  return timed;
}

/**
 * When every move starts and every pass flies. A pass is ready once the
 * previous pass of its ball is caught and any Run it waits on (`after`) has
 * finished, and flies to the catch point: waypoint `at` of the receiver's Run,
 * or its end. Receivers are timed to the ball (ADR 0005): a receiver who would
 * arrive early has its whole Run slowed, never below walk, then its start
 * delayed for whatever slowing cannot absorb. A receiver who would be late even
 * at its own Paces is not waited for: the pass goes later, from wherever the
 * passer has run to, so the ball arrives with the receiver. A receiver whose
 * move waits on the pass has not set off: the pass fires as soon as the ball
 * is free and is caught on its cell. A Kick to space (`cell`) has no receiver:
 * it flies when ready to its cell at kick speed, then rolls on and lies loose.
 */
function timeline(cells: Map<string, Cell>, moveList: Move[], passes: BallPass[], area: Area) {
  const moves = new Map(moveList.map((m) => [m.marker, m]));
  const runs = new Map(moveList.map((m) => [m.marker, runOf(cells.get(m.marker)!, m)]));
  const passIndex = new Map(passes.map((p, i) => [p.id, i]));
  const { edges, inPlace } = waitEdges(moves, passes);
  const timedBy = timedReceivers(moves, passes, edges, inPlace);
  const naturalStarts = new Map<string, number>();
  const played = new Map<string, { run: Run; start: number }>();
  const flights: PassFlight[] = [];

  /** When a Run would start if it were not timed to a pass. */
  const naturalStartOf = (marker: string): number => {
    let start = naturalStarts.get(marker);
    if (start === undefined) {
      const after = moves.get(marker)!.after;
      start =
        after?.move !== undefined ? endOf(after.move)
        : after?.pass !== undefined ? flight(passIndex.get(after.pass)!).land
        : 0;
      naturalStarts.set(marker, start);
    }
    return start;
  };

  /** A Run as played: slowed and started late if it is timed to a pass it would reach early. */
  const playedRun = (marker: string): { run: Run; start: number } => {
    let result = played.get(marker);
    if (result === undefined) {
      const run = runs.get(marker)!;
      const start = naturalStartOf(marker);
      result = { run, start };
      const i = timedBy.get(marker);
      if (i !== undefined) {
        const { land } = flight(i);
        const reach = runDuration(run, passes[i].at);
        if (land - (start + reach) > 1e-9) {
          const slowest = PACE_SPEEDS_MPS[run.move.pace ?? DEFAULT_PACE] / PACE_SPEEDS_MPS.walk;
          const scale = reach > 0 ? Math.min(slowest, (land - start) / reach) : 1;
          result = { run: { ...run, profile: slowedProfile(run.profile, scale) }, start: land - reach * scale };
        }
      }
      played.set(marker, result);
    }
    return result;
  };

  const endOf = (marker: string, upto?: number): number => {
    const { run, start } = playedRun(marker);
    return start + runDuration(run, upto);
  };

  const pointAt = (marker: string, t: number): Point => {
    if (moves.has(marker)) {
      const { run, start } = playedRun(marker);
      return pointAlong(run, t - start);
    }
    const cell = cells.get(marker)!;
    return { x: cell.x, y: cell.y };
  };

  const flight = (i: number): PassFlight => {
    if (flights[i]) return flights[i];
    const pass = passes[i];
    let previous = i - 1;
    while (previous >= 0 && passes[previous].ball !== pass.ball) previous--;
    const caught = previous >= 0 ? flight(previous).land : 0;
    const ready = Math.max(caught, pass.after ? endOf(pass.after.move) : 0);
    // A passer whose own move waits on this pass has not set off yet.
    const fromCell = cells.get(pass.from)!;
    const passerRuns = moves.has(pass.from) && !waitsOn(edges, `move:${pass.from}`, new Set([`pass:${pass.id}`]));
    const startAt = (t: number): Point => (passerRuns ? pointAt(pass.from, t) : { x: fromCell.x, y: fromCell.y });
    const speed = pass.kick ? KICK_SPEED_MPS : PASS_SPEED_MPS;
    const flightTime = (from: Point, to: Point) => (distance(from, to) * CELL_SIZE_M) / speed;
    const record = (fire: number, start: Point, end: Point, land = fire + flightTime(start, end)): PassFlight => {
      // A Kick to space lands, rolls on and lies loose.
      const resting = pass.cell && rollTo(start, end, area);
      const roll = resting && { to: resting, until: land + (distance(resting, end) > 0 ? KICK_ROLL_S : 0) };
      return (flights[i] = {
        id: pass.id,
        ball: pass.ball,
        from: pass.from,
        ...(pass.to !== undefined && { to: pass.to }),
        start,
        end,
        ...(pass.kick && { kick: true }),
        fire,
        land,
        ...(roll && { roll }),
      });
    };

    // A Kick to space has no receiver to time: it goes as soon as it is ready.
    if (pass.cell) return record(ready, startAt(ready), { x: pass.cell.x, y: pass.cell.y });
    const to = pass.to!;
    const receiver = moves.get(to);
    if (receiver === undefined || inPlace.has(pass.id)) {
      const cell = cells.get(to)!;
      return record(ready, startAt(ready), { x: cell.x, y: cell.y });
    }
    const point = receiver.waypoints[pass.at ?? receiver.waypoints.length - 1];
    const catchPoint = { x: point.x, y: point.y };
    const timed = timedBy.get(to) === i;
    // When the receiver reaches the catch point: at its own Paces if its Run is timed to this pass.
    const arrival = timed ? naturalStartOf(to) + runDuration(runs.get(to)!, pass.at) : endOf(to, pass.at);
    let fire = ready;
    let start = startAt(fire);
    if (arrival - (fire + flightTime(start, catchPoint)) > 1e-9) {
      // Late: the passer runs on and the ball goes when it can be taken. Every
      // Pace is slower than the ball, so solving for the throw point converges.
      for (let k = 0; k < 40; k++) {
        fire = Math.max(ready, arrival - flightTime(start, catchPoint));
        start = startAt(fire);
      }
      return record(fire, start, catchPoint);
    }
    // Early: a timed receiver is slowed to meet the ball. An untimed one that
    // catches on the run is led, aiming at where it will be when the ball lands.
    if (timed || pass.at === undefined) return record(fire, start, catchPoint);
    let end = pointAt(to, fire);
    let land = fire;
    for (let k = 0; k < 40; k++) {
      land = fire + flightTime(start, end);
      end = pointAt(to, land);
    }
    return record(fire, start, end, land);
  };

  passes.forEach((_, i) => flight(i));
  return { flights, endOf, pointAt };
}

/** The first pair of holds of different balls by one player that overlap in time, as a fault on the later catch. */
function heldTwice(flights: PassFlight[], startHolders: Map<string, string>): StepIssue | null {
  interface Hold { ball: string; holder: string; from: number; to: number; pass?: string }
  const holds: Hold[] = [];
  for (const [ball, first] of startHolders) {
    let hold: Hold | null = { ball, holder: first, from: 0, to: Infinity };
    for (const f of flights.filter((x) => x.ball === ball)) {
      if (hold) {
        hold.to = f.fire;
        holds.push(hold);
      }
      // After a Kick to space nobody holds the ball.
      hold = f.to === undefined ? null : { ball, holder: f.to, from: f.land, to: Infinity, pass: f.id };
    }
    if (hold) holds.push(hold);
  }
  for (const a of holds) {
    for (const b of holds) {
      const later = a.from < b.from || (a.from === b.from && a.ball < b.ball);
      if (b.pass === undefined || a.ball === b.ball || a.holder !== b.holder || !later) continue;
      if (Math.min(a.to, b.to) - b.from > 1e-9) {
        return {
          target: { kind: 'pass', id: b.pass },
          field: 'to',
          message: `marker "${b.holder}" catches ball "${b.ball}" while still holding ball "${a.ball}"; a player cannot hold two balls at once`,
        };
      }
    }
  }
  return null;
}

/** A pass caught further ahead than this, in metres, goes forward. */
export const FORWARD_PASS_TOLERANCE_M = 0.5;

/** Metres a point moves in the Direction of attack (negative is backward). */
function gainAlong(direction: Direction, from: Point, to: Point): number {
  switch (direction) {
    case 'up': return from.y - to.y;
    case 'down': return to.y - from.y;
    case 'left': return from.x - to.x;
    case 'right': return to.x - from.x;
    default: return 0;
  }
}

/** Whether a ball thrown from `from` and caught at `to` goes forward in the direction of attack. */
export function isForwardPass(direction: Direction | undefined, from: Point, to: Point): boolean {
  if (!direction || direction === 'none') return false;
  return gainAlong(direction, from, to) > FORWARD_PASS_TOLERANCE_M + 1e-9;
}

const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left', none: 'none' };

/** Team a marker plays for: its own, else attack for attackers and coaches, defence for defenders. */
function teamOf(marker: ResolvedMarker | undefined): 'attack' | 'defence' {
  return marker?.team ?? (marker?.kind === 'defender' ? 'defence' : 'attack');
}

/**
 * Warnings for a validated script: a pass is forward when it is caught more than
 * 0.5 m ahead of where it was thrown, measured in the Direction of attack, using
 * the real throw and catch points (the ball leads an untimed receiver on the run).
 * Also an early catch: the receiver reaches its catch point before the passer has the ball.
 * Never blocks saving. Forward passes need a Direction of attack; early catches do not.
 */
export function warnings(script: PracticeScript): ValidationWarning[] {
  const found: ValidationWarning[] = [];
  for (let n = 0; n < stepCount(script); n++) {
    const step = resolveStep(script, n);
    const { flights, endOf } = stepTimeline(step);
    const label = (id: string) => step.markers.find((m) => m.id === id)?.label ?? id;
    const marker = (id: string) => step.markers.find((m) => m.id === id);
    /** The Direction of attack belongs to the team holding each ball at the start. */
    const startTeam = (ball: string) => teamOf(marker(marker(ball)?.holder ?? ''));
    step.passes.forEach((pass, i) => {
      const flight = flights.find((f) => f.id === pass.id);
      if (!flight) return;
      const direction = script.direction && teamOf(marker(pass.from)) !== startTeam(flight.ball) ? OPPOSITE[script.direction] : script.direction;
      if (!pass.kick && pass.cell === undefined && isForwardPass(direction, flight.start, flight.end)) {
        found.push({ step: n, pass: pass.id, kind: 'forward', message: `Pass ${i + 1} goes forward` });
      }
      // A catch on the run slides later when the receiver passes waypoint `at` before the passer has the ball.
      if (pass.at === undefined || pass.to === undefined || !step.moves.some((m) => m.marker === pass.to)) return;
      const sameBall = flights.filter((f) => f.ball === flight.ball);
      const previous = sameBall[sameBall.indexOf(flight) - 1];
      if (previous && endOf(pass.to, pass.at) < previous.land - 1e-9) {
        found.push({
          step: n,
          pass: pass.id,
          kind: 'early',
          message: `${label(pass.to)} reaches the catch point before ${label(pass.from)} has the ball`,
          fix: { marker: pass.to, afterPass: previous.id },
        });
      }
    });
  }
  return found;
}

/** Plain-language line for a warning, naming the Step when it is not the first. */
export function formatWarning(warning: ValidationWarning): string {
  return warning.step === 0 ? warning.message : `Step ${warning.step + 1}: ${warning.message}`;
}

/** The timeline of a resolved Step, with each pass on its ball. */
function stepTimeline(step: ResolvedStep) {
  const cells = new Map(step.markers.map((m) => [m.id, m.cell]));
  const defaultBall = step.markers.find((m) => m.kind === 'ball')?.id;
  return timeline(cells, step.moves, step.passes.map((p) => ({ ...p, ball: p.ball ?? defaultBall! })), step.area);
}

/** Every marker's position at `t` seconds into the Step, plus the Step's duration and pass flights. */
export function positionsAt(step: ResolvedStep, t: number): StepPositions {
  const { flights, endOf, pointAt } = stepTimeline(step);
  const time = Math.max(0, t);
  let duration = Math.max(0, ...flights.map((f) => f.roll?.until ?? f.land));
  for (const move of step.moves) duration = Math.max(duration, endOf(move.marker));

  /** A ball is held (it rides with its holder), in flight, or loose on the ground. */
  const ballAt = (ball: ResolvedMarker): Point => {
    let holder = ball.holder;
    let loose: Point = { x: ball.cell.x, y: ball.cell.y };
    for (const f of flights.filter((x) => x.ball === ball.id)) {
      if (time < f.fire) break;
      if (time < f.land) {
        const k = (time - f.fire) / (f.land - f.fire);
        return { x: f.start.x + (f.end.x - f.start.x) * k, y: f.start.y + (f.end.y - f.start.y) * k };
      }
      holder = f.to;
      if (holder === undefined) loose = rollAt(f, time);
    }
    return holder === undefined ? loose : pointAt(holder, time);
  };

  const positions: Record<string, Point> = {};
  for (const marker of step.markers) {
    positions[marker.id] = marker.kind === 'ball' ? ballAt(marker) : pointAt(marker.id, time);
  }
  return { duration, positions, passes: flights };
}
