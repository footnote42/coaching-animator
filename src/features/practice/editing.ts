/**
 * Hand editing of a Practice Script: pure edits over the base Step and inside
 * Progressions, plus an undo/redo history of whole-script snapshots. The
 * editor writes the same Practice Script an agent writes (ADR 0002), so every
 * edit keeps the script shaped by the schema and snaps positions to grid cells.
 */
import { formatError, looseBalls, positionsAt, resolveStep, stepCount, validate, type LooseBall, type ResolvedStep } from '@/features/practice/engine';
import {
  BALL_CARRIER_KINDS,
  LYING_KINDS,
  MAX_BALLS,
  MAX_COACHING_POINTS,
  MAX_MARKERS,
  MAX_PASSES,
  MAX_WAYPOINTS,
  SCHEMA_VERSION,
  type Area,
  type Cell,
  type Change,
  type ConeColour,
  type Direction,
  type Lever,
  type Marker,
  type MarkerKind,
  type Move,
  type Pace,
  type Pass,
  type Placement,
  type PracticeScript,
  type Wait,
  type Waypoint,
} from '@/features/practice/schema';

/** A point in cell units; fractions allowed (a drop between cells). */
export interface CellPoint {
  x: number;
  y: number;
}

/** One hand edit of the base Step. Positions are snapped to the nearest cell. */
export type Edit =
  /**
   * `colour` applies to cones only; yellow (the default) is stored as nothing.
   * `reach` applies to the ball only: a free player within that many cells of
   * `at` takes it, else it lies loose on the ground (default `BALL_REACH_CELLS`).
   */
  | { type: 'addMarker'; kind: MarkerKind; at: CellPoint; colour?: ConeColour; reach?: number }
  /** `reach` as for `addMarker`, when the marker is the ball. */
  | { type: 'moveMarker'; marker: string; at: CellPoint; reach?: number }
  | { type: 'removeMarker'; marker: string }
  | { type: 'addWaypoint'; marker: string; at: CellPoint }
  | { type: 'moveWaypoint'; marker: string; index: number; at: CellPoint }
  | { type: 'removeWaypoint'; marker: string; index: number }
  | { type: 'setPace'; marker: string; pace: Pace }
  /** Pace of the segment arriving at waypoint `index` of the marker's run; null goes back to the run's Pace. */
  | { type: 'setWaypointPace'; marker: string; index: number; pace: Pace | null }
  /** Hold on arriving at waypoint `index` of the marker's run until `hold` is over (ADR 0007); null runs straight on. */
  | { type: 'setWaypointHold'; marker: string; index: number; hold: Wait | null }
  | { type: 'removeMove'; marker: string }
  /** `ball` is the ball passed; left out, it is the first ball. `kick` makes it a Kick. */
  | { type: 'addPass'; from: string; to: string; ball?: string; kick?: boolean }
  /** Kick to space: the ball's holder kicks it to the cell at `at`, where it lands, rolls on and lies loose. */
  | { type: 'addKickToSpace'; from: string; at: CellPoint; ball?: string }
  /**
   * Collect: send `marker` to the loose ball (default: the first ball) so they
   * pick it up. Their Run is extended to the cell it lies on, or its last
   * waypoint moved there when that is close by (a Run is added if they have
   * none), and the pass that Collects the ball, if there is one, becomes theirs.
   */
  | { type: 'setCollector'; marker: string; ball?: string }
  /** Make a pass a kick (slower, through the air) or an ordinary pass again. */
  | { type: 'setKick'; id: string; kick: boolean }
  /** Change which ball a pass moves. */
  | { type: 'setPassBall'; id: string; ball: string }
  /** Add another ball (up to the limit), held by a player who has none. */
  | { type: 'addBall'; holder: string }
  | { type: 'removePass'; id: string }
  /** Catch on the run at waypoint `at` of the receiver's run; null catches at the end of the run. */
  | { type: 'setCatch'; id: string; at: number | null }
  /** Release the ball at waypoint `release` of the passer's run, who runs on without it; null passes as soon as the pass is ready. */
  | { type: 'setRelease'; id: string; release: number | null }
  /** Make a pass also wait for the run of marker `move` to finish (draw and pass); null waits for nothing extra. */
  | { type: 'setPassWait'; id: string; move: string | null }
  /** Catch on the run at the point of the receiver's run nearest `at`: reuse a waypoint within a cell, else add one there. */
  | { type: 'addCatchPoint'; id: string; at: CellPoint }
  /** Release at the point of the passer's run nearest `at`: reuse a waypoint within a cell, else add one there. */
  | { type: 'addReleasePoint'; id: string; at: CellPoint }
  /** Start a marker's run once pass `pass` is caught; null starts it at the beginning of the Step. */
  | { type: 'startAfterPass'; marker: string; pass: string | null }
  /** Make a marker's run start once `wait` is over (a run ending, a pass caught, or a marker reaching a waypoint); null starts it at the beginning of the Step. */
  | { type: 'setStartAfter'; marker: string; wait: Wait | null }
  /** Make a pass also wait for `wait`; null waits for nothing extra. */
  | { type: 'setPassAfter'; id: string; wait: Wait | null }
  | { type: 'setLabel'; marker: string; label: string | undefined }
  /** Colour a cone; yellow clears it. Other kinds are left alone. */
  | { type: 'setColour'; marker: string; colour: ConeColour }
  /** Lay a tackle shield or tackle bag flat (Lying) or stand it up. Other kinds are refused. */
  | { type: 'setLying'; marker: string; lying: boolean };

/** What a tap on the canvas does: select and drag, draw a run, link a pass, or place a marker. */
export type EditorTool = 'select' | 'run' | 'pass' | MarkerKind;

export interface EditorSelection {
  marker: string | null;
  /** Index of the selected waypoint in the selected marker's run. */
  waypoint: number | null;
}

export const NO_SELECTION: EditorSelection = { marker: null, waypoint: null };

/** Area a new Practice starts with. */
export const NEW_PRACTICE_AREA: Area = { width: 20, length: 20 };

export function emptyScript(area: Area = NEW_PRACTICE_AREA): PracticeScript {
  return {
    schemaVersion: SCHEMA_VERSION,
    area: { ...area },
    markers: [],
    base: { placements: [], moves: [], passes: [], commentary: { points: [] } },
    progressions: [],
  };
}

/** Nearest cell to a point, kept inside the Area. */
export function snapCell(at: CellPoint, area: Area): Cell {
  const clamp = (v: number, max: number) => Math.min(Math.max(Math.round(v), 0), max - 1);
  return { x: clamp(at.x, area.width), y: clamp(at.y, area.length) };
}

const ID_PREFIX: Record<MarkerKind, string> = {
  attacker: 'a',
  defender: 'd',
  coach: 'coach',
  ball: 'ball',
  cone: 'cone',
  'tackle-shield': 'shield',
  'tackle-bag': 'bag',
};

const LABEL_PREFIX: Partial<Record<MarkerKind, string>> = { attacker: 'A', defender: 'D', coach: 'C' };

const LOOSE_BALL = 'The ball is lying loose: use Collect to send a player to it, then pass or kick from them.';
const NOT_LOOSE = 'The ball is not lying loose: kick it to space or put it on the ground first.';

/** A collector's last waypoint this close (in cells) to the loose ball is moved onto it; further away the Run is extended. */
const COLLECT_REDIRECT_CELLS = 3;

const isCarrier = (kind: MarkerKind | undefined) =>
  kind !== undefined && (BALL_CARRIER_KINDS as readonly string[]).includes(kind);

/** A catch or release tap this close (in cells) to a waypoint uses it instead of adding one. */
const CATCH_SNAP_CELLS = 1;

/** A ball dropped this close (in cells) to a free player goes into their hands; further away it lies loose. */
export const BALL_REACH_CELLS = 1.5;

const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

function kindOf(script: PracticeScript, id: string): MarkerKind | undefined {
  return script.markers.find((m) => m.id === id)?.kind;
}

/** Starting cell of a marker in the base Step (the ball's is its holder's, or the cell it lies loose on). */
export function startCell(script: PracticeScript, id: string): Cell | undefined {
  const placement = script.base.placements.find((p) => p.marker === id);
  if (!placement) return undefined;
  return placement.holder !== undefined ? startCell(script, placement.holder) : placement.cell;
}

/** Ids of the declared balls, in order. The first is the default for a pass. */
export function ballIds(script: PracticeScript): string[] {
  return script.markers.filter((m) => m.kind === 'ball').map((m) => m.id);
}

/** Id of a ball's holder at the start of the base Step (default: the first ball), if there is one. */
export function ballHolder(script: PracticeScript, ball: string | undefined = ballIds(script)[0]): string | undefined {
  return ball === undefined ? undefined : script.base.placements.find((p) => p.marker === ball)?.holder;
}

/** Who holds a ball (default: the first) once every base pass of it has been caught; undefined while it lies loose. */
export function holderAfterPasses(script: PracticeScript, ball: string | undefined = ballIds(script)[0]): string | undefined {
  const first = ballIds(script)[0];
  const mine = script.base.passes.filter((p) => (p.ball ?? first) === ball);
  const last = mine[mine.length - 1];
  return last ? last.to : ballHolder(script, ball);
}

/**
 * The last time a ball (default: the first) lies loose in the base Step: the
 * cell it lies on and the pass that Collects it, if any. Undefined when it never lies loose.
 */
export function lastLooseBall(script: PracticeScript, ball: string | undefined = ballIds(script)[0]): LooseBall | undefined {
  if (ball === undefined) return undefined;
  try {
    return looseBalls(resolveStep(script, 0)).filter((l) => l.ball === ball).pop();
  } catch {
    return undefined;
  }
}

/** Whether `marker` is on their way to Collect a ball nobody has Collected yet: their Run ends where it lies. */
export function isCollector(script: PracticeScript, marker: string, ball: string | undefined = ballIds(script)[0]): boolean {
  const loose = lastLooseBall(script, ball);
  if (!loose || loose.collect !== undefined) return false;
  const move = script.base.moves.find((m) => m.marker === marker);
  const end = move?.waypoints[move.waypoints.length - 1];
  return end !== undefined && sameCell(end, loose.cell);
}

/** Players holding a ball at the start of the base Step, leaving out the holder of ball `except`. */
function holdersExcept(script: PracticeScript, except?: string): Set<string> {
  const holders = new Set<string>();
  for (const p of script.base.placements) if (p.holder !== undefined && p.marker !== except) holders.add(p.holder);
  return holders;
}

/** Nearest placed attacker, defender or coach to a cell (within `reach` cells), skipping `except` and anyone in `busy`. */
function nearestCarrier(script: PracticeScript, cell: CellPoint, except?: string, busy?: Set<string>, reach = Infinity): string | undefined {
  let best: string | undefined;
  let bestDistance = reach + 1e-9;
  for (const p of script.base.placements) {
    if (p.marker === except || busy?.has(p.marker) || !p.cell || !isCarrier(kindOf(script, p.marker))) continue;
    const d = Math.hypot(p.cell.x - cell.x, p.cell.y - cell.y);
    if (d < bestDistance) {
      bestDistance = d;
      best = p.marker;
    }
  }
  return best;
}

function nextNumber(ids: string[], prefix: string): number {
  let n = 1;
  while (ids.includes(`${prefix}${n}`)) n++;
  return n;
}

function withBase(script: PracticeScript, base: Partial<PracticeScript['base']>): PracticeScript {
  return { ...script, base: { ...script.base, ...base } };
}

function mapMove(script: PracticeScript, marker: string, f: (move: Move) => Move | null): PracticeScript {
  const moves = script.base.moves.flatMap((move) => {
    if (move.marker !== marker) return [move];
    const next = f(move);
    return next ? [next] : [];
  });
  return cleanWaits(withBase(script, { moves }));
}

/** Put a ball in a player's hands, or loose on a cell, at the start of the base Step. */
function placeBall(script: PracticeScript, ballId: string, start: { holder: string } | { cell: Cell }): PracticeScript {
  const placement: Placement = { marker: ballId, ...start };
  const placements = script.base.placements.some((p) => p.marker === ballId)
    ? script.base.placements.map((p) => (p.marker === ballId ? placement : p))
    : [...script.base.placements, placement];
  return repairPasses(withBase(script, { placements }));
}

/** Where a ball dropped at `at` starts: with a free player within `reach` cells, else loose on the nearest cell. */
function ballStart(script: PracticeScript, ballId: string | undefined, at: CellPoint, reach = BALL_REACH_CELLS): { holder: string } | { cell: Cell } {
  const holder = nearestCarrier(script, at, undefined, holdersExcept(script, ballId), reach);
  return holder ? { holder } : { cell: snapCell(at, script.area) };
}

/**
 * Keep only passes that still chain from their ball's holder: each must come
 * from whoever holds that ball when it fires and go to another carrier. The
 * pass of a loose ball must come from a carrier with a Run (its collector),
 * ending on the cell where a ball that starts loose lies.
 */
export function repairPasses(script: PracticeScript): PracticeScript {
  const holders = new Map<string, string>();
  /** Balls nobody holds: the cell one that starts loose lies on, or null after a Kick to space. */
  const loose = new Map<string, Cell | null>();
  for (const p of script.base.placements) {
    if (p.holder !== undefined) holders.set(p.marker, p.holder);
    else if (p.cell && kindOf(script, p.marker) === 'ball') loose.set(p.marker, p.cell);
  }
  const firstBall = script.markers.find((m) => m.kind === 'ball')?.id;
  const placed = (id: string) => script.base.placements.some((p) => p.marker === id);
  const passes: Pass[] = [];
  for (const pass of script.base.passes) {
    const ball = pass.ball ?? firstBall;
    if (ball === undefined) continue;
    const holder = holders.get(ball);
    const lying = loose.get(ball);
    if (holder === undefined) {
      // A Collect: the passer must run to the ball.
      const run = script.base.moves.find((m) => m.marker === pass.from);
      const end = run?.waypoints[run.waypoints.length - 1];
      if (lying === undefined || !end || !isCarrier(kindOf(script, pass.from)) || !placed(pass.from)) continue;
      if (lying !== null && !sameCell(end, lying)) continue;
    } else if (pass.from !== holder) continue;
    if (pass.to === pass.from) continue;
    const to = pass.to;
    if (to !== undefined && (!isCarrier(kindOf(script, to)) || !placed(to))) continue;
    passes.push(pass);
    // After a Kick to space the ball lies loose: nobody holds it.
    if (to === undefined) {
      holders.delete(ball);
      loose.set(ball, null);
    } else {
      holders.set(ball, to);
      loose.delete(ball);
    }
  }
  if (passes.length === script.base.passes.length) return script;
  return cleanWaits(withBase(script, { passes }));
}

/** Drop catch waypoints the receiver's run no longer has, and Release waypoints the passer's run no longer has. */
function cleanCatches(script: PracticeScript): PracticeScript {
  let changed = false;
  const fits = (marker: string | undefined, index: number) => {
    const move = script.base.moves.find((m) => m.marker === marker);
    return move !== undefined && index < move.waypoints.length;
  };
  const passes = script.base.passes.map((pass) => {
    let next = pass;
    if (next.at !== undefined && !fits(next.to, next.at)) {
      const { at: _dropped, ...rest } = next;
      void _dropped;
      next = rest;
    }
    if (next.release !== undefined && !fits(next.from, next.release)) {
      const { release: _dropped, ...rest } = next;
      void _dropped;
      next = rest;
    }
    if (next !== pass) changed = true;
    return next;
  });
  return changed ? withBase(script, { passes }) : script;
}

/**
 * The point of a marker's run nearest `at`: an existing waypoint within a cell
 * (`index`), or where to add one (`insert`, before the waypoint now at that
 * index). `'no run'` or `'start'` when the marker has no run or the point is
 * its starting cell, or a message.
 */
function pointOnRun(
  script: PracticeScript,
  marker: string,
  at: CellPoint,
): { index: number } | { insert: number; cell: Cell } | string {
  const move = script.base.moves.find((m) => m.marker === marker);
  const start = startCell(script, marker);
  if (!move || !start) return 'no run';
  const path = [start, ...move.waypoints];
  // Nearest point on the run: project onto each leg, keep the closest.
  let best = { dist: Infinity, leg: 0, x: start.x, y: start.y };
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.min(Math.max(((at.x - a.x) * dx + (at.y - a.y) * dy) / len2, 0), 1);
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    const dist = Math.hypot(at.x - x, at.y - y);
    if (dist < best.dist) best = { dist, leg: i, x, y };
  }
  // Close to a waypoint: use it instead of adding another.
  let near = -1;
  let nearDist = CATCH_SNAP_CELLS;
  move.waypoints.forEach((w, i) => {
    const d = Math.hypot(best.x - w.x, best.y - w.y);
    if (d <= nearDist) {
      near = i;
      nearDist = d;
    }
  });
  if (near >= 0) return { index: near };
  const cell = snapCell({ x: best.x, y: best.y }, script.area);
  if (sameCell(cell, start)) return 'start';
  if (move.waypoints.length >= MAX_WAYPOINTS) return `A run holds at most ${MAX_WAYPOINTS} waypoints.`;
  return { insert: best.leg, cell };
}

/**
 * Add waypoint `cell` to a marker's run at `index`. It splits a segment, so both
 * halves keep that segment's Pace. Later waypoints shift up one, and so do the
 * catches (`at`) and Releases on them.
 */
function insertWaypoint(script: PracticeScript, marker: string, index: number, cell: Cell): PracticeScript {
  const moves = script.base.moves.map((m) => {
    if (m.marker !== marker) return m;
    const { pace } = m.waypoints[index];
    const added = pace === undefined ? cell : { ...cell, pace };
    return { ...m, waypoints: [...m.waypoints.slice(0, index), added, ...m.waypoints.slice(index)] };
  });
  const shift: WaypointShift = { marker, index, by: 1 };
  const passes = script.base.passes.map((p) => shiftPass(p, shift));
  return withBase(script, { moves: moves.map((m) => shiftMoveWait(m, shift)), passes });
}

/** A waypoint added (`by` 1) or removed (`by` -1) at `index` of `marker`'s Run. */
interface WaypointShift {
  marker: string;
  index: number;
  by: 1 | -1;
}

/**
 * A wait's reach waypoint after a shift of that marker's Run: later ones move by
 * one; a wait on a removed waypoint goes (undefined). The same wait when nothing changes.
 */
function shiftWait(wait: Wait | undefined, s: WaypointShift): Wait | undefined {
  if (!wait?.reach || wait.reach.marker !== s.marker || wait.reach.waypoint < s.index) return wait;
  if (s.by === -1 && wait.reach.waypoint === s.index) return undefined;
  return { reach: { marker: s.marker, waypoint: wait.reach.waypoint + s.by } };
}

function withoutHold(waypoint: Waypoint): Waypoint {
  const { hold: _dropped, ...rest } = waypoint;
  void _dropped;
  return rest;
}

/**
 * Keep a Run's waits on their waypoints after a shift of the watched Run: its `after`
 * and every hold. A wait on a removed waypoint goes (the Run starts at once, or does not stop).
 * Works on a move or a `setMove` change; the same object when nothing changes.
 */
function shiftMoveWait<M extends { after?: Wait; waypoints: Waypoint[] }>(move: M, s: WaypointShift): M {
  const after = shiftWait(move.after, s);
  let waypoints = move.waypoints;
  if (waypoints.some((w) => w.hold && shiftWait(w.hold, s) !== w.hold)) {
    waypoints = waypoints.map((w) => {
      if (!w.hold) return w;
      const hold = shiftWait(w.hold, s);
      return hold === w.hold ? w : hold ? { ...w, hold } : withoutHold(w);
    });
  }
  if (after === move.after && waypoints === move.waypoints) return move;
  const { after: _old, ...rest } = move;
  void _old;
  return { ...rest, waypoints, ...(after && { after }) } as M;
}

/**
 * Keep a pass's catch (`at`), Release and `after` reach on their waypoints after
 * a shift of the receiver's, passer's or watched Run: later ones move by one,
 * one on a removed waypoint goes. Returns the same pass when nothing changes.
 */
function shiftPass<P extends Pass>(p: P, s: WaypointShift): P {
  const shift = (index: number | undefined) =>
    index === undefined || index < s.index ? index : s.by === -1 && index === s.index ? undefined : index + s.by;
  const at = p.to === s.marker ? shift(p.at) : p.at;
  const release = p.from === s.marker ? shift(p.release) : p.release;
  const after = shiftWait(p.after, s);
  if (at === p.at && release === p.release && after === p.after) return p;
  const { at: _at, release: _release, after: _after, ...rest } = p;
  void _at;
  void _release;
  void _after;
  return { ...rest, ...(at !== undefined && { at }), ...(release !== undefined && { release }), ...(after !== undefined && { after }) } as P;
}

/** The shift `edit` makes to a Run's waypoints in `step` (a base-only script), if any. */
function waypointShift(step: PracticeScript, edit: Edit): WaypointShift | undefined {
  if (edit.type === 'removeWaypoint') {
    const move = step.base.moves.find((m) => m.marker === edit.marker);
    return move?.waypoints[edit.index] ? { marker: edit.marker, index: edit.index, by: -1 } : undefined;
  }
  if (edit.type !== 'addCatchPoint' && edit.type !== 'addReleasePoint') return undefined;
  const pass = step.base.passes.find((p) => p.id === edit.id);
  const marker = edit.type === 'addCatchPoint' ? pass?.to : pass?.from;
  if (marker === undefined) return undefined;
  const point = pointOnRun(step, marker, edit.at);
  return typeof point === 'object' && 'insert' in point ? { marker, index: point.insert, by: 1 } : undefined;
}

/**
 * Carry a waypoint shift made in Step n into later Progressions' setPass
 * changes, up to the first one that replaces or removes that marker's Run
 * (its indices, and those after it, refer to the new Run).
 */
function shiftLaterSteps(script: PracticeScript, n: number, s: WaypointShift): PracticeScript {
  let replaced = false;
  const progressions = script.progressions.map((p, i) => {
    // progressions[i] is Step i + 1, so the later Steps are i >= n.
    if (i < n || replaced) return p;
    if (p.changes.some((c) => (c.type === 'setMove' || c.type === 'removeMove' || c.type === 'removeMarker') && c.marker === s.marker)) {
      replaced = true;
      return p;
    }
    // A later Step's setPass and setMove (its waits on this Run: a start `after` and holds) keep the waypoints they named.
    const changes = p.changes.map((c) => (c.type === 'setPass' ? shiftPass(c, s) : c.type === 'setMove' ? shiftMoveWait(c, s) : c));
    return changes.every((c, j) => c === p.changes[j]) ? p : { ...p, changes };
  });
  return { ...script, progressions };
}

/** Drop `after` waits that point at a move or pass no longer in the base Step, and stale catch waypoints. */
function cleanWaits(input: PracticeScript): PracticeScript {
  const script = cleanCatches(input);
  const moved = new Set(script.base.moves.map((m) => m.marker));
  const passIds = new Set(script.base.passes.map((p) => p.id));
  const waypointCount = new Map(script.base.moves.map((m) => [m.marker, m.waypoints.length]));
  const broken = (after: Wait) =>
    (after.move !== undefined && !moved.has(after.move)) ||
    (after.pass !== undefined && !passIds.has(after.pass)) ||
    (after.reach !== undefined && after.reach.waypoint >= (waypointCount.get(after.reach.marker) ?? 0));
  let changed = false;
  const moves = script.base.moves.map((original) => {
    let move = original;
    if (move.after && broken(move.after)) {
      const { after: _dropped, ...rest } = move;
      void _dropped;
      move = rest;
    }
    // A hold waiting on something that is gone goes too: the player runs straight on.
    if (move.waypoints.some((w) => w.hold && broken(w.hold))) {
      move = { ...move, waypoints: move.waypoints.map((w) => (w.hold && broken(w.hold) ? withoutHold(w) : w)) };
    }
    if (move !== original) changed = true;
    return move;
  });
  let passesChanged = false;
  const passes = script.base.passes.map((pass) => {
    if (!pass.after || !broken(pass.after)) return pass;
    passesChanged = true;
    const { after: _dropped, ...rest } = pass;
    void _dropped;
    return rest;
  });
  return changed || passesChanged ? withBase(script, { moves: changed ? moves : script.base.moves, passes: passesChanged ? passes : script.base.passes }) : script;
}

/**
 * Send `marker` to a loose ball: their Run ends on the cell it lies on (moving
 * a nearby last waypoint there, else adding one, or a new Run) and the pass
 * that Collects it, if there is one, comes from them. The same script when they already do.
 */
function sendToBall(script: PracticeScript, marker: string, loose: LooseBall): PracticeScript | string {
  const { cell } = loose;
  const collect = loose.collect === undefined ? undefined : script.base.passes.find((p) => p.id === loose.collect);
  if (collect?.to === marker) return 'That player receives the pass after the Collect: pick someone else, or delete that pass first.';
  const move = script.base.moves.find((m) => m.marker === marker);
  let moves = script.base.moves;
  if (!move) {
    moves = [...moves, { marker, waypoints: [cell] }];
  } else {
    let next: Move = move;
    const last = move.waypoints[move.waypoints.length - 1];
    if (!sameCell(last, cell)) {
      const near = Math.hypot(last.x - cell.x, last.y - cell.y) <= COLLECT_REDIRECT_CELLS;
      // Moving the last waypoint keeps the Pace of the stretch into it.
      const waypoints = near || move.waypoints.length >= MAX_WAYPOINTS
        ? [...move.waypoints.slice(0, -1), { ...last, ...cell }]
        : [...move.waypoints, cell];
      next = { ...next, waypoints };
    }
    // A collector's Run cannot wait for the pass they make once they have the ball.
    if (collect && next.after?.pass === collect.id) {
      const { after: _dropped, ...rest } = next;
      void _dropped;
      next = rest;
    }
    if (next !== move) moves = moves.map((m) => (m === move ? next : m));
  }
  let passes = script.base.passes;
  if (collect && (collect.from !== marker || collect.release !== undefined)) {
    // A collector's Run ends at the ball, so there is nothing to release on.
    const { release: _dropped, ...rest } = collect;
    void _dropped;
    passes = passes.map((p) => (p === collect ? { ...rest, from: marker } : p));
  }
  if (moves === script.base.moves && passes === script.base.passes) return script;
  return cleanWaits(withBase(script, { moves, passes }));
}

/**
 * Apply one edit to the base Step. Returns the new script, the same script when
 * the edit changes nothing, or a message saying why it cannot be made.
 */
export function applyEdit(script: PracticeScript, edit: Edit): PracticeScript | string {
  const area = script.area;
  switch (edit.type) {
    case 'addMarker': {
      const cell = snapCell(edit.at, area);
      if (edit.kind === 'ball') {
        const existing = script.markers.find((m) => m.kind === 'ball');
        const start = ballStart(script, existing?.id, edit.at, edit.reach);
        if (existing) return placeBall(script, existing.id, start);
        if (script.markers.length >= MAX_MARKERS) return `A Practice holds at most ${MAX_MARKERS} markers.`;
        const id = script.markers.some((m) => m.id === 'ball') ? `ball${nextNumber(script.markers.map((m) => m.id), 'ball')}` : 'ball';
        return placeBall({ ...script, markers: [...script.markers, { id, kind: 'ball' }] }, id, start);
      }
      if (script.markers.length >= MAX_MARKERS) return `A Practice holds at most ${MAX_MARKERS} markers.`;
      const prefix = ID_PREFIX[edit.kind];
      const n = nextNumber(script.markers.map((m) => m.id), prefix);
      const marker: Marker = { id: `${prefix}${n}`, kind: edit.kind };
      const label = LABEL_PREFIX[edit.kind];
      if (label) marker.label = `${label}${n}`.slice(0, 4);
      if (edit.kind === 'cone' && edit.colour && edit.colour !== 'yellow') marker.colour = edit.colour;
      return {
        ...script,
        markers: [...script.markers, marker],
        base: { ...script.base, placements: [...script.base.placements, { marker: marker.id, cell }] },
      };
    }

    case 'moveMarker': {
      const cell = snapCell(edit.at, area);
      const kind = kindOf(script, edit.marker);
      if (kind === undefined) return `No marker "${edit.marker}".`;
      if (kind === 'ball') {
        const start = ballStart(script, edit.marker, edit.at, edit.reach);
        const current = script.base.placements.find((p) => p.marker === edit.marker);
        if (current && same(startOf(current), start)) return script;
        return placeBall(script, edit.marker, start);
      }
      const current = startCell(script, edit.marker);
      if (current && sameCell(current, cell)) return script;
      // Keep everything else about the start, e.g. a shield stays Lying.
      const placements = script.base.placements.map((p) => (p.marker === edit.marker ? { ...p, cell } : p));
      return withBase(script, { placements });
    }

    case 'removeMarker': {
      const kind = kindOf(script, edit.marker);
      if (kind === undefined) return script;
      let next: PracticeScript = {
        ...script,
        markers: script.markers.filter((m) => m.id !== edit.marker),
        base: {
          ...script.base,
          placements: script.base.placements.filter((p) => p.marker !== edit.marker),
          moves: script.base.moves.filter((m) => m.marker !== edit.marker),
          passes: kind === 'ball' ? script.base.passes.filter((p) => (p.ball ?? ballIds(script)[0]) !== edit.marker) : script.base.passes,
        },
      };
      // A ball whose holder was removed goes to the nearest free player, or goes too.
      for (const ball of ballIds(next)) {
        if (ballHolder(script, ball) !== edit.marker) continue;
        const holder = nearestCarrier(next, startCell(script, edit.marker)!, undefined, holdersExcept(next, ball));
        next = holder
          ? withBase(next, { placements: next.base.placements.map((p) => (p.marker === ball ? { marker: ball, holder } : p)) })
          : {
              ...next,
              markers: next.markers.filter((m) => m.id !== ball),
              base: {
                ...next.base,
                placements: next.base.placements.filter((p) => p.marker !== ball),
                passes: next.base.passes.filter((p) => (p.ball ?? ballIds(script)[0]) !== ball),
              },
            };
      }
      return cleanWaits(repairPasses(next));
    }

    case 'addWaypoint': {
      const kind = kindOf(script, edit.marker);
      if (kind === undefined) return `No marker "${edit.marker}".`;
      if (kind === 'ball') return 'The ball does not run on its own: it moves with its holder or on a pass.';
      const cell = snapCell(edit.at, area);
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move) {
        const start = startCell(script, edit.marker);
        if (start && sameCell(start, cell)) return script;
        return withBase(script, { moves: [...script.base.moves, { marker: edit.marker, waypoints: [cell] }] });
      }
      if (sameCell(move.waypoints[move.waypoints.length - 1], cell)) return script;
      if (move.waypoints.length >= MAX_WAYPOINTS) return `A run holds at most ${MAX_WAYPOINTS} waypoints.`;
      return mapMove(script, edit.marker, (m) => ({ ...m, waypoints: [...m.waypoints, cell] }));
    }

    case 'moveWaypoint': {
      const cell = snapCell(edit.at, area);
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move || !move.waypoints[edit.index]) return script;
      if (sameCell(move.waypoints[edit.index], cell)) return script;
      return mapMove(script, edit.marker, (m) => ({
        ...m,
        // Keep the segment's own Pace, if it has one.
        waypoints: m.waypoints.map((w, i) => (i === edit.index ? { ...w, ...cell } : w)),
      }));
    }

    case 'removeWaypoint': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move || !move.waypoints[edit.index]) return script;
      // Catches and Releases on later waypoints shift down one; one on the removed waypoint goes.
      const shift: WaypointShift = { marker: edit.marker, index: edit.index, by: -1 };
      const passes = script.base.passes.map((p) => shiftPass(p, shift));
      const shifted = withBase(script, { passes, moves: script.base.moves.map((m) => shiftMoveWait(m, shift)) });
      return mapMove(shifted, edit.marker, (m) =>
        m.waypoints.length === 1 ? null : { ...m, waypoints: m.waypoints.filter((_, i) => i !== edit.index) },
      );
    }

    case 'setPace': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move || (move.pace ?? 'jog') === edit.pace) return script;
      return mapMove(script, edit.marker, (m) => ({ ...m, pace: edit.pace }));
    }

    case 'setWaypointPace': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move) return 'That player has no run.';
      const waypoint = move.waypoints[edit.index];
      if (!waypoint) return 'That point is not on the run.';
      if ((waypoint.pace ?? null) === edit.pace) return script;
      const { pace: _old, ...cell } = waypoint;
      void _old;
      const next = edit.pace === null ? cell : { ...cell, pace: edit.pace };
      return mapMove(script, edit.marker, (m) => ({ ...m, waypoints: m.waypoints.map((w, i) => (i === edit.index ? next : w)) }));
    }

    case 'setWaypointHold': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move) return 'That player has no run.';
      const waypoint = move.waypoints[edit.index];
      if (!waypoint) return 'That point is not on the run.';
      if (same(waypoint.hold ?? null, edit.hold)) return script;
      const next = edit.hold === null ? withoutHold(waypoint) : { ...waypoint, hold: edit.hold };
      return mapMove(script, edit.marker, (m) => ({ ...m, waypoints: m.waypoints.map((w, i) => (i === edit.index ? next : w)) }));
    }

    case 'startAfterPass': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move) return 'That player has no run.';
      if (edit.pass !== null && !script.base.passes.some((p) => p.id === edit.pass)) return 'That pass is not in this Practice.';
      return mapMove(script, edit.marker, ({ after: _old, ...rest }) => {
        void _old;
        return edit.pass === null ? rest : { ...rest, after: { pass: edit.pass } };
      });
    }

    case 'setStartAfter': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move) return 'That player has no run.';
      if (same(move.after ?? null, edit.wait)) return script;
      return mapMove(script, edit.marker, ({ after: _old, ...rest }) => {
        void _old;
        return edit.wait === null ? rest : { ...rest, after: edit.wait };
      });
    }

    case 'setPassAfter': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass) return script;
      if (same(pass.after ?? null, edit.wait)) return script;
      const { after: _old, ...rest } = pass;
      void _old;
      const next = edit.wait === null ? rest : { ...rest, after: edit.wait };
      return withBase(script, { passes: script.base.passes.map((p) => (p.id === edit.id ? next : p)) });
    }

    case 'removeMove':
      if (!script.base.moves.some((m) => m.marker === edit.marker)) return script;
      return mapMove(script, edit.marker, () => null);

    case 'addBall': {
      if (!isCarrier(kindOf(script, edit.holder))) return 'Only attackers, defenders and coaches hold the ball.';
      if (ballIds(script).length >= MAX_BALLS) return `A Practice holds at most ${MAX_BALLS} balls.`;
      if (holdersExcept(script).has(edit.holder)) return 'That player already has a ball.';
      if (script.markers.length >= MAX_MARKERS) return `A Practice holds at most ${MAX_MARKERS} markers.`;
      const ids = script.markers.map((m) => m.id);
      const id = ids.includes('ball') ? `ball${nextNumber(ids, 'ball')}` : 'ball';
      return placeBall({ ...script, markers: [...script.markers, { id, kind: 'ball' }] }, id, { holder: edit.holder });
    }

    case 'setPassBall': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass) return script;
      const balls = ballIds(script);
      if (!balls.includes(edit.ball)) return `No ball "${edit.ball}".`;
      if ((pass.ball ?? balls[0]) === edit.ball) return script;
      const { ball: _old, ...rest } = pass;
      void _old;
      const next = edit.ball === balls[0] ? rest : { ...rest, ball: edit.ball };
      const moved = repairPasses(withBase(script, { passes: script.base.passes.map((p) => (p.id === edit.id ? next : p)) }));
      return moved.base.passes.length === script.base.passes.length
        ? moved
        : 'That ball is not with the passer at that point in its passes.';
    }

    case 'addPass': {
      const balls = ballIds(script);
      const ball = edit.ball ?? balls[0];
      if (ball !== undefined && !balls.includes(ball)) return `No ball "${ball}".`;
      const holder = holderAfterPasses(script, ball);
      if (ball === undefined) return 'Place the ball first: a pass needs someone holding it.';
      // A loose ball is passed by the player running to Collect it.
      if (holder === undefined && !isCollector(script, edit.from, ball)) return LOOSE_BALL;
      if (edit.from === edit.to) return 'A player cannot pass to themselves.';
      if (!isCarrier(kindOf(script, edit.from)) || !isCarrier(kindOf(script, edit.to))) {
        return 'Only attackers, defenders and coaches pass and receive.';
      }
      if (holder !== undefined && edit.from !== holder) {
        const label = script.markers.find((m) => m.id === holder)?.label ?? holder;
        return `${label} has the ball at that point, so the next pass must come from ${label}.`;
      }
      if (script.base.passes.length >= MAX_PASSES) return `A Step holds at most ${MAX_PASSES} passes.`;
      const id = `p${nextNumber(script.base.passes.map((p) => p.id), 'p')}`;
      const pass: Pass = { id, from: edit.from, to: edit.to, ...(ball !== balls[0] && { ball }), ...(edit.kick && { kick: true }) };
      return withBase(script, { passes: [...script.base.passes, pass] });
    }

    case 'addKickToSpace': {
      const balls = ballIds(script);
      const ball = edit.ball ?? balls[0];
      if (ball !== undefined && !balls.includes(ball)) return `No ball "${ball}".`;
      const holder = holderAfterPasses(script, ball);
      if (ball === undefined) return 'Place the ball first: a kick needs someone holding it.';
      if (holder === undefined && !isCollector(script, edit.from, ball)) return LOOSE_BALL;
      if (holder !== undefined && edit.from !== holder) {
        const label = script.markers.find((m) => m.id === holder)?.label ?? holder;
        return `${label} has the ball at that point, so the next kick must come from ${label}.`;
      }
      const cell = snapCell(edit.at, area);
      const from = holder === undefined ? lastLooseBall(script, ball)?.cell : startCell(script, edit.from);
      if (from && sameCell(from, cell)) return 'Tap further away to kick into space.';
      if (script.base.passes.length >= MAX_PASSES) return `A Step holds at most ${MAX_PASSES} passes.`;
      const id = `k${nextNumber(script.base.passes.map((p) => p.id), 'k')}`;
      const pass: Pass = { id, from: edit.from, cell, ...(ball !== balls[0] && { ball }), kick: true };
      return withBase(script, { passes: [...script.base.passes, pass] });
    }

    case 'setCollector': {
      const balls = ballIds(script);
      const ball = edit.ball ?? balls[0];
      if (ball === undefined || !balls.includes(ball)) return 'Place the ball first.';
      const kind = kindOf(script, edit.marker);
      if (kind === undefined) return `No marker "${edit.marker}".`;
      if (!isCarrier(kind)) return 'Only attackers, defenders and coaches Collect the ball.';
      if (!lastLooseBall(script, ball)) return NOT_LOOSE;
      // Where a kicked ball stops can depend on the collector's Run (a kicker chasing
      // their own kick), so send them again until it settles.
      let next = script;
      for (let k = 0; k < 4; k++) {
        const loose = lastLooseBall(next, ball);
        if (!loose) return NOT_LOOSE;
        const sent = sendToBall(next, edit.marker, loose);
        if (typeof sent === 'string' || sent === next) return sent;
        next = sent;
      }
      return 'Where the ball stops keeps moving with this player’s Run: draw their Run to the ball by hand.';
    }

    case 'removePass': {
      if (!script.base.passes.some((p) => p.id === edit.id)) return script;
      return repairPasses(withBase(script, { passes: script.base.passes.filter((p) => p.id !== edit.id) }));
    }

    case 'setCatch': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass || (pass.at ?? null) === edit.at) return script;
      const { at: _old, ...rest } = pass;
      void _old;
      if (edit.at !== null) {
        if (pass.to === undefined) return 'A Kick to space has no receiver to catch on the run.';
        const move = script.base.moves.find((m) => m.marker === pass.to);
        if (!move) return 'The receiver has no run: draw one to catch on the run.';
        if (edit.at < 0 || edit.at >= move.waypoints.length) return 'That point is not on the receiver’s run.';
      }
      const next = edit.at === null ? rest : { ...rest, at: edit.at };
      return withBase(script, { passes: script.base.passes.map((p) => (p.id === edit.id ? next : p)) });
    }

    case 'setKick': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass || (pass.kick ?? false) === edit.kick) return script;
      if (pass.cell) return 'A Kick to space is always a kick: delete it to pass instead.';
      const { kick: _old, ...rest } = pass;
      void _old;
      const next = edit.kick ? { ...rest, kick: true } : rest;
      return withBase(script, { passes: script.base.passes.map((p) => (p.id === edit.id ? next : p)) });
    }

    case 'setPassWait': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass || (pass.after?.move ?? null) === edit.move) return script;
      const { after: _old, ...rest } = pass;
      void _old;
      if (edit.move !== null && !script.base.moves.some((m) => m.marker === edit.move)) return 'That player has no run to wait for.';
      const next = edit.move === null ? rest : { ...rest, after: { move: edit.move } };
      return withBase(script, { passes: script.base.passes.map((p) => (p.id === edit.id ? next : p)) });
    }

    case 'addCatchPoint': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass) return script;
      if (pass.to === undefined) return 'A Kick to space has no receiver to catch on the run.';
      const point = pointOnRun(script, pass.to, edit.at);
      if (point === 'no run') return 'The receiver has no run: draw one to catch on the run.';
      if (point === 'start') return 'Tap further along the run to catch there.';
      if (typeof point === 'string') return point;
      if ('index' in point) {
        const last = script.base.moves.find((m) => m.marker === pass.to)!.waypoints.length - 1;
        return applyEdit(script, { type: 'setCatch', id: edit.id, at: point.index === last ? null : point.index });
      }
      const added = insertWaypoint(script, pass.to, point.insert, point.cell);
      return withBase(added, { passes: added.base.passes.map((p) => (p.id === edit.id ? { ...p, at: point.insert } : p)) });
    }

    case 'setRelease': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass || (pass.release ?? null) === edit.release) return script;
      const { release: _old, ...rest } = pass;
      void _old;
      if (edit.release !== null) {
        const move = script.base.moves.find((m) => m.marker === pass.from);
        if (!move) return 'The passer has no run: draw one to release on the run.';
        if (edit.release < 0 || edit.release >= move.waypoints.length) return 'That point is not on the passer’s run.';
        if (move.after?.pass === pass.id) return 'The passer’s run starts after this pass, so it cannot be released on the run.';
      }
      const next = edit.release === null ? rest : { ...rest, release: edit.release };
      return withBase(script, { passes: script.base.passes.map((p) => (p.id === edit.id ? next : p)) });
    }

    case 'addReleasePoint': {
      const pass = script.base.passes.find((p) => p.id === edit.id);
      if (!pass) return script;
      const point = pointOnRun(script, pass.from, edit.at);
      if (point === 'no run') return 'The passer has no run: draw one to release on the run.';
      if (point === 'start') return 'Tap further along the run to release there.';
      if (typeof point === 'string') return point;
      if ('index' in point) return applyEdit(script, { type: 'setRelease', id: edit.id, release: point.index });
      return applyEdit(insertWaypoint(script, pass.from, point.insert, point.cell), { type: 'setRelease', id: edit.id, release: point.insert });
    }

    case 'setLabel': {
      const marker = script.markers.find((m) => m.id === edit.marker);
      if (!marker) return script;
      const label = edit.label && edit.label.trim().length > 0 ? edit.label : undefined;
      if (marker.label === label) return script;
      const next = { ...marker, label };
      if (!next.label) delete next.label;
      return { ...script, markers: script.markers.map((m) => (m.id === edit.marker ? next : m)) };
    }

    case 'setColour': {
      const marker = script.markers.find((m) => m.id === edit.marker);
      if (!marker || marker.kind !== 'cone') return script;
      const colour = edit.colour === 'yellow' ? undefined : edit.colour;
      if (marker.colour === colour) return script;
      const next = { ...marker, colour };
      if (!next.colour) delete next.colour;
      return { ...script, markers: script.markers.map((m) => (m.id === edit.marker ? next : m)) };
    }

    case 'setLying': {
      const kind = kindOf(script, edit.marker);
      if (kind === undefined) return `No marker "${edit.marker}".`;
      if (!(LYING_KINDS as readonly string[]).includes(kind)) return 'Only a tackle shield or tackle bag can be laid flat.';
      const placement = script.base.placements.find((p) => p.marker === edit.marker);
      if (!placement || (placement.lying ?? false) === edit.lying) return script;
      const { lying: _old, ...rest } = placement;
      void _old;
      const next: Placement = edit.lying ? { ...rest, lying: true } : rest;
      return withBase(script, { placements: script.base.placements.map((p) => (p === placement ? next : p)) });
    }
  }
}

/**
 * The waits a run (`{ move }`) or a pass (`{ pass }`) can be given in `step`:
 * another run ending, a pass caught, or a marker reaching a waypoint. A choice
 * that would make waits loop (or is otherwise refused) is left out, as is the
 * wait it already has. `kinds` limits which kinds are offered.
 */
export function waitOptions(
  script: PracticeScript,
  step: ResolvedStep,
  subject: WaitSubject,
  kinds: ReadonlyArray<'move' | 'pass' | 'reach'> = ['move', 'pass', 'reach'],
): Wait[] {
  const base = stepAsBase(script, step);
  const candidates: Wait[] = [];
  if (kinds.includes('move')) for (const m of step.moves) candidates.push({ move: m.marker });
  if (kinds.includes('pass')) for (const p of step.passes) candidates.push({ pass: p.id });
  if (kinds.includes('reach')) {
    for (const m of step.moves) m.waypoints.forEach((_, waypoint) => candidates.push({ reach: { marker: m.marker, waypoint } }));
  }
  const current = currentWait(step, subject);
  return candidates.filter((wait) => {
    if (current && same(current, wait)) return false;
    // A hold waiting on its own run reaching this point or an earlier one is over at once: not worth offering.
    if ('hold' in subject && wait.reach?.marker === subject.hold.marker && wait.reach.waypoint <= subject.hold.index) return false;
    const next = applyEdit(base, waitEdit(subject, wait));
    return typeof next !== 'string' && validate(next).ok;
  });
}

/** What a wait is for: a run's start, a pass, or the hold on a run's waypoint. */
export type WaitSubject = { move: string } | { pass: string } | { hold: { marker: string; index: number } };

/** The wait `subject` has in `step`, if any. */
export function currentWait(step: ResolvedStep, subject: WaitSubject): Wait | undefined {
  if ('move' in subject) return step.moves.find((m) => m.marker === subject.move)?.after;
  if ('pass' in subject) return step.passes.find((p) => p.id === subject.pass)?.after;
  return step.moves.find((m) => m.marker === subject.hold.marker)?.waypoints[subject.hold.index]?.hold;
}

function waitEdit(subject: WaitSubject, wait: Wait | null): Edit {
  if ('move' in subject) return { type: 'setStartAfter', marker: subject.move, wait };
  if ('pass' in subject) return { type: 'setPassAfter', id: subject.pass, wait };
  return { type: 'setWaypointHold', marker: subject.hold.marker, index: subject.hold.index, hold: wait };
}

/**
 * The first Step the engine cannot work out, or undefined if every Step
 * resolves and plays. Validation passing does not promise this (#187), so an
 * edit must clear it too or the editor would crash to the error boundary.
 *
 * Every Step is checked: a base edit reaches all of them, and resolving plus a
 * handful of samples per Step is cheap next to the validation already done.
 * Sample times are the start, each pass's fire and land time, and the end:
 * the instants where the engine switches between its branches.
 */
function firstUnplayableStep(script: PracticeScript): number | undefined {
  for (let n = 0; n < stepCount(script); n++) {
    try {
      const step = resolveStep(script, n);
      const { duration, passes } = positionsAt(step, 0);
      const times = new Set([duration, ...passes.flatMap((f) => [f.fire, f.land])]);
      for (const t of times) positionsAt(step, t);
    } catch {
      return n;
    }
  }
  return undefined;
}

/**
 * Refuse an edit that turns a valid script into an invalid one (typically by
 * breaking a change in a later Progression), or into one the engine cannot
 * play. Emptying the script is allowed: that is a fresh start, not a broken
 * Practice.
 */
function keepValid(before: PracticeScript, after: PracticeScript | string, refusal: string): PracticeScript | string {
  if (typeof after === 'string' || after === before || after.markers.length === 0) return after;
  const result = validate(after);
  if (!result.ok) return validate(before).ok ? `${refusal}: ${formatError(result.errors[0])}` : after;
  const broken = firstUnplayableStep(after);
  if (broken === undefined || firstUnplayableStep(before) !== undefined) return after;
  return `${refusal}: Step ${broken + 1} can’t be animated with that change. Undo it or try something simpler.`;
}

/** Drop declared markers that no Step places any more (e.g. added then removed in one Progression). */
function pruneMarkers(script: PracticeScript): PracticeScript {
  const placed = new Set(script.base.placements.map((p) => p.marker));
  for (const progression of script.progressions) {
    for (const change of progression.changes) if (change.type === 'addMarker') placed.add(change.marker);
  }
  const markers = script.markers.filter((m) => placed.has(m.id));
  return markers.length === script.markers.length ? script : { ...script, markers };
}

/** A resolved Step written as a base-only script, so base edits can run on it. */
function stepAsBase(script: PracticeScript, step: ResolvedStep): PracticeScript {
  return {
    ...script,
    area: step.area,
    base: {
      placements: step.markers.map((m): Placement =>
        m.holder !== undefined
          ? { marker: m.id, holder: m.holder }
          : { marker: m.id, cell: m.cell, ...(m.lying && { lying: true }) },
      ),
      moves: step.moves,
      passes: step.passes,
      commentary: step.commentary,
    },
    progressions: [],
  };
}

/** JSON with undefined fields dropped and keys sorted, for comparing values. */
const canon = (value: unknown) =>
  JSON.stringify(value, (_, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([, x]) => x !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : 1)),
        )
      : v,
  );
const same = (a: unknown, b: unknown) => canon(a) === canon(b);

/** Where a placement starts, as a placeMarker change writes it (a loose ball is just a cell). */
function startOf(placement: Placement): { cell: Cell; lying?: boolean } | { holder: string } {
  if (placement.holder !== undefined) return { holder: placement.holder };
  return { cell: placement.cell!, ...(placement.lying && { lying: true }) };
}

function moveChange(move: Move): Change {
  return {
    type: 'setMove',
    marker: move.marker,
    waypoints: move.waypoints,
    ...(move.pace !== undefined && { pace: move.pace }),
    ...(move.after !== undefined && { after: move.after }),
  };
}

/**
 * The changes that turn one Step (as a base-only script) into another. Each
 * marker, move and pass gets at most one change, so repeated edits coalesce.
 * Pass order is kept: a pass that has to move to the end is removed and re-set.
 */
function diffSteps(prev: PracticeScript, next: PracticeScript): Change[] {
  const changes: Change[] = [];
  if (!same(prev.area, next.area)) {
    const { template, width, length } = next.area;
    changes.push({ type: 'setArea', ...(template !== undefined && { template }), width, length });
  }

  const before = new Map(prev.base.placements.map((p) => [p.marker, p]));
  const after = new Map(next.base.placements.map((p) => [p.marker, p]));
  for (const id of before.keys()) if (!after.has(id)) changes.push({ type: 'removeMarker', marker: id });
  for (const [id, placement] of after) {
    const old = before.get(id);
    if (!old) changes.push({ type: 'addMarker', marker: id, ...startOf(placement) });
    else if (!same(startOf(old), startOf(placement))) changes.push({ type: 'placeMarker', marker: id, ...startOf(placement) });
  }

  const oldMoves = new Map(prev.base.moves.map((m) => [m.marker, m]));
  const newMoves = new Map(next.base.moves.map((m) => [m.marker, m]));
  for (const id of oldMoves.keys()) {
    if (!newMoves.has(id) && after.has(id)) changes.push({ type: 'removeMove', marker: id });
  }
  for (const [id, move] of newMoves) {
    const old = before.has(id) ? oldMoves.get(id) : undefined;
    if (!old || !same(old, move)) changes.push(moveChange(move));
  }

  const nextIds = new Set(next.base.passes.map((p) => p.id));
  for (const pass of prev.base.passes) if (!nextIds.has(pass.id)) changes.push({ type: 'removePass', id: pass.id });
  const kept = prev.base.passes.filter((p) => nextIds.has(p.id));
  let i = 0;
  for (; i < next.base.passes.length && i < kept.length && kept[i].id === next.base.passes[i].id; i++) {
    const pass = next.base.passes[i];
    if (!same(kept[i], pass)) changes.push({ type: 'setPass', ...pass });
  }
  const tail = next.base.passes.slice(i);
  for (const pass of tail) if (kept.some((p) => p.id === pass.id)) changes.push({ type: 'removePass', id: pass.id });
  for (const pass of tail) changes.push({ type: 'setPass', ...pass });
  return changes;
}

const stepMissing = (n: number) => `There is no Step ${n}.`;
const BREAKS_LATER_STEP = 'That change would make a later Step impossible — undo it or edit that Step first';

/**
 * Rewrite Progression n (Step n, n >= 1) by editing its resolved state, then
 * storing the difference from Step n - 1 as its changes. The base and earlier
 * Steps are untouched; later Steps carry the result forward.
 */
function editProgression(
  script: PracticeScript,
  n: number,
  edit: (step: PracticeScript) => PracticeScript | string,
  later: (script: PracticeScript) => PracticeScript = (s) => s,
): PracticeScript | string {
  if (!script.progressions[n - 1]) return stepMissing(n);
  let prev: PracticeScript;
  let current: PracticeScript;
  try {
    prev = stepAsBase(script, resolveStep(script, n - 1));
    current = stepAsBase(script, resolveStep(script, n));
  } catch {
    return `Step ${n} can’t be edited until the script is fixed.`;
  }
  const edited = edit(current);
  if (typeof edited === 'string') return edited;
  if (edited === current) return script;
  const declared = new Set(script.markers.map((m) => m.id));
  const next = pruneMarkers(
    later({
      ...script,
      markers: [...script.markers, ...edited.markers.filter((m) => !declared.has(m.id))],
      progressions: script.progressions.map((p, i) => (i === n - 1 ? { ...p, changes: diffSteps(prev, edited) } : p)),
    }),
  );
  return keepValid(script, next, BREAKS_LATER_STEP);
}

/**
 * Apply one edit to Step n: the base Step (n = 0) directly, or a Progression by
 * recording the edit as that Progression's changes. Refuses an edit that would
 * break a later Step. Returns the new script, the same script for a no-op, or
 * a message saying why it cannot be made.
 */
export function applyStepEdit(script: PracticeScript, n: number, edit: Edit): PracticeScript | string {
  // Later Steps' catches and Releases follow a waypoint added to or removed from a Run they inherit.
  let shift: WaypointShift | undefined;
  const later = (next: PracticeScript) => (shift ? shiftLaterSteps(next, n, shift) : next);
  if (n === 0) {
    shift = waypointShift(script, edit);
    const after = applyEdit(script, edit);
    return keepValid(script, typeof after === 'string' || after === script ? after : later(after), BREAKS_LATER_STEP);
  }
  return editProgression(
    script,
    n,
    (step) => {
      shift = waypointShift(step, edit);
      return applyEdit(step, edit);
    },
    later,
  );
}

/**
 * Set the Area of Step n. For the base it is the Practice's Area; in a
 * Progression it becomes a setArea change, which needs the Space lever.
 */
export function applyStepArea(script: PracticeScript, n: number, area: Area): PracticeScript | string {
  if (n === 0) {
    if (same(script.area, area)) return script;
    return keepValid(script, { ...script, area }, 'The Area can’t change like that');
  }
  const progression = script.progressions[n - 1];
  if (!progression) return stepMissing(n);
  if (progression.lever !== undefined && progression.lever !== 'space') {
    return 'Only a Progression that pulls the Space lever can change the Area. Set its Lever to Space first.';
  }
  return editProgression(script, n, (step) => (same(step.area, area) ? step : { ...step, area }));
}

/** Set the Direction of attack of the whole Practice. */
export function applyDirection(script: PracticeScript, direction: Direction): PracticeScript {
  return script.direction === direction ? script : { ...script, direction };
}

/** Add an empty Progression after the last Step. */
export function addProgression(script: PracticeScript, lever?: Lever): PracticeScript {
  return { ...script, progressions: [...script.progressions, { ...(lever ? { lever } : {}), commentary: { points: [] }, changes: [] }] };
}

/**
 * Move Progression n (Step n) one place earlier (-1) or later (+1). The chain
 * re-resolves in the new order; a move that would break a change is refused.
 */
export function moveProgression(script: PracticeScript, n: number, by: -1 | 1): PracticeScript | string {
  const from = n - 1;
  const to = from + by;
  if (!script.progressions[from]) return stepMissing(n);
  if (to < 0 || to >= script.progressions.length) return script;
  const progressions = [...script.progressions];
  [progressions[from], progressions[to]] = [progressions[to], progressions[from]];
  return keepValid(script, { ...script, progressions }, 'That Step can’t move there');
}

/** Delete Progression n (Step n). Refused if a later Step depends on its changes. */
export function removeProgression(script: PracticeScript, n: number): PracticeScript | string {
  if (!script.progressions[n - 1]) return stepMissing(n);
  const next = pruneMarkers({ ...script, progressions: script.progressions.filter((_, i) => i !== n - 1) });
  return keepValid(script, next, 'That Step can’t be deleted');
}

function withLever<T extends { lever?: Lever }>(p: T, lever: Lever | undefined): T {
  const { lever: _old, ...rest } = p;
  return (lever ? { ...rest, lever } : rest) as T;
}

/** Change the Lever of Progression n (Step n); undefined clears it. */
export function setLever(script: PracticeScript, n: number, lever: Lever | undefined): PracticeScript | string {
  const progression = script.progressions[n - 1];
  if (!progression) return stepMissing(n);
  if (progression.lever === lever) return script;
  const progressions = script.progressions.map((p, i) => (i === n - 1 ? withLever(p, lever) : p));
  return keepValid(script, { ...script, progressions }, 'That Lever doesn’t fit this Step');
}

/** Most characters in one coaching point. */
export const MAX_POINT_LENGTH = 200;

/**
 * Replace the coaching points of Step n (base or Progression). Points are
 * trimmed and blank ones dropped, so clearing a point removes it.
 */
export function setCommentary(script: PracticeScript, n: number, points: string[]): PracticeScript | string {
  const cleaned = points.map((p) => p.trim()).filter((p) => p.length > 0);
  if (cleaned.length > MAX_COACHING_POINTS) return `A Step holds at most ${MAX_COACHING_POINTS} coaching points.`;
  if (cleaned.some((p) => p.length > MAX_POINT_LENGTH)) return `A coaching point is at most ${MAX_POINT_LENGTH} characters.`;
  if (n === 0) {
    if (same(script.base.commentary.points, cleaned)) return script;
    return withBase(script, { commentary: { points: cleaned } });
  }
  const progression = script.progressions[n - 1];
  if (!progression) return stepMissing(n);
  if (same(progression.commentary.points, cleaned)) return script;
  const progressions = script.progressions.map((p, i) => (i === n - 1 ? { ...p, commentary: { points: cleaned } } : p));
  return { ...script, progressions };
}

/** Most snapshots kept for undo. */
export const MAX_HISTORY = 100;

/** The script being edited plus its undo and redo stacks (whole-script snapshots). */
export interface EditorState {
  script: PracticeScript;
  past: PracticeScript[];
  future: PracticeScript[];
}

export type EditorAction =
  /** Start over from a script with no history (a new or opened Practice). */
  | { type: 'load'; script: PracticeScript }
  /** Replace the script as one undoable step (an edit result or a pasted script). */
  | { type: 'commit'; script: PracticeScript }
  | { type: 'undo' }
  | { type: 'redo' };

export function initialEditorState(script: PracticeScript = emptyScript()): EditorState {
  return { script, past: [], future: [] };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'load':
      return initialEditorState(action.script);
    case 'commit':
      if (action.script === state.script) return state;
      return { script: action.script, past: [...state.past, state.script].slice(-MAX_HISTORY), future: [] };
    case 'undo': {
      if (state.past.length === 0) return state;
      return {
        script: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.script, ...state.future],
      };
    }
    case 'redo': {
      if (state.future.length === 0) return state;
      return { script: state.future[0], past: [...state.past, state.script], future: state.future.slice(1) };
    }
  }
}

/** Apply an edit as an undoable step; returns the state unchanged with a message if it cannot be made. */
export function editScript(state: EditorState, edit: Edit): { state: EditorState; error?: string } {
  const result = applyEdit(state.script, edit);
  if (typeof result === 'string') return { state, error: result };
  return { state: editorReducer(state, { type: 'commit', script: result }) };
}
