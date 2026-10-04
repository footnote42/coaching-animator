/**
 * Hand editing of a Practice Script: pure edits over the base Step and inside
 * Progressions, plus an undo/redo history of whole-script snapshots. The
 * editor writes the same Practice Script an agent writes (ADR 0002), so every
 * edit keeps the script shaped by the schema and snaps positions to grid cells.
 */
import { formatError, resolveStep, validate, type ResolvedStep } from '@/features/practice/engine';
import {
  BALL_CARRIER_KINDS,
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
} from '@/features/practice/schema';

/** A point in cell units; fractions allowed (a drop between cells). */
export interface CellPoint {
  x: number;
  y: number;
}

/** One hand edit of the base Step. Positions are snapped to the nearest cell. */
export type Edit =
  /** `colour` applies to cones only; yellow (the default) is stored as nothing. */
  | { type: 'addMarker'; kind: MarkerKind; at: CellPoint; colour?: ConeColour }
  | { type: 'moveMarker'; marker: string; at: CellPoint }
  | { type: 'removeMarker'; marker: string }
  | { type: 'addWaypoint'; marker: string; at: CellPoint }
  | { type: 'moveWaypoint'; marker: string; index: number; at: CellPoint }
  | { type: 'removeWaypoint'; marker: string; index: number }
  | { type: 'setPace'; marker: string; pace: Pace }
  | { type: 'removeMove'; marker: string }
  /** `ball` is the ball passed; left out, it is the first ball. */
  | { type: 'addPass'; from: string; to: string; ball?: string }
  /** Make a pass a kick (slower, through the air) or an ordinary pass again. */
  | { type: 'setKick'; id: string; kick: boolean }
  /** Change which ball a pass moves. */
  | { type: 'setPassBall'; id: string; ball: string }
  /** Add another ball (up to the limit), held by a player who has none. */
  | { type: 'addBall'; holder: string }
  | { type: 'removePass'; id: string }
  /** Catch on the run at waypoint `at` of the receiver's run; null catches at the end of the run. */
  | { type: 'setCatch'; id: string; at: number | null }
  /** Make a pass also wait for the run of marker `move` to finish (draw and pass); null waits for nothing extra. */
  | { type: 'setPassWait'; id: string; move: string | null }
  /** Catch on the run at the point of the receiver's run nearest `at`: reuse a waypoint within a cell, else add one there. */
  | { type: 'addCatchPoint'; id: string; at: CellPoint }
  /** Start a marker's run once pass `pass` is caught; null starts it at the beginning of the Step. */
  | { type: 'startAfterPass'; marker: string; pass: string | null }
  | { type: 'setLabel'; marker: string; label: string | undefined }
  /** Colour a cone; yellow clears it. Other kinds are left alone. */
  | { type: 'setColour'; marker: string; colour: ConeColour };

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
};

const LABEL_PREFIX: Partial<Record<MarkerKind, string>> = { attacker: 'A', defender: 'D', coach: 'C' };

const isCarrier = (kind: MarkerKind | undefined) =>
  kind !== undefined && (BALL_CARRIER_KINDS as readonly string[]).includes(kind);

/** A catch tap this close (in cells) to a waypoint uses it instead of adding one. */
const CATCH_SNAP_CELLS = 1;

const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

function kindOf(script: PracticeScript, id: string): MarkerKind | undefined {
  return script.markers.find((m) => m.id === id)?.kind;
}

/** Starting cell of a marker in the base Step (the ball's is its holder's). */
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

/** Who holds a ball (default: the first) once every base pass of it has been caught. */
export function holderAfterPasses(script: PracticeScript, ball: string | undefined = ballIds(script)[0]): string | undefined {
  const first = ballIds(script)[0];
  const mine = script.base.passes.filter((p) => (p.ball ?? first) === ball);
  const last = mine[mine.length - 1];
  return last ? last.to : ballHolder(script, ball);
}

/** Players holding a ball at the start of the base Step, leaving out the holder of ball `except`. */
function holdersExcept(script: PracticeScript, except?: string): Set<string> {
  const holders = new Set<string>();
  for (const p of script.base.placements) if (p.holder !== undefined && p.marker !== except) holders.add(p.holder);
  return holders;
}

/** Nearest placed attacker, defender or coach to a cell, skipping `except` and anyone in `busy`. */
function nearestCarrier(script: PracticeScript, cell: Cell, except?: string, busy?: Set<string>): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
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

/** Set (or, for the ball, re-hold) where a marker starts in the base Step. */
function placeBall(script: PracticeScript, ballId: string, holder: string): PracticeScript {
  const placements = script.base.placements.some((p) => p.marker === ballId)
    ? script.base.placements.map((p) => (p.marker === ballId ? { marker: ballId, holder } : p))
    : [...script.base.placements, { marker: ballId, holder }];
  return repairPasses(withBase(script, { placements }));
}

/**
 * Keep only passes that still chain from their ball's holder: each must come
 * from whoever holds that ball when it fires and go to another carrier.
 */
export function repairPasses(script: PracticeScript): PracticeScript {
  const holders = new Map<string, string>();
  for (const p of script.base.placements) if (p.holder !== undefined) holders.set(p.marker, p.holder);
  const firstBall = script.markers.find((m) => m.kind === 'ball')?.id;
  const passes: Pass[] = [];
  for (const pass of script.base.passes) {
    const ball = pass.ball ?? firstBall;
    const holder = ball === undefined ? undefined : holders.get(ball);
    if (ball === undefined || holder === undefined) continue;
    if (pass.from !== holder || pass.to === pass.from || !isCarrier(kindOf(script, pass.to))) continue;
    if (!script.base.placements.some((p) => p.marker === pass.to)) continue;
    passes.push(pass);
    holders.set(ball, pass.to);
  }
  if (passes.length === script.base.passes.length) return script;
  return cleanWaits(withBase(script, { passes }));
}

/** Drop catch waypoints the receiver's run no longer has. */
function cleanCatches(script: PracticeScript): PracticeScript {
  let changed = false;
  const passes = script.base.passes.map((pass) => {
    if (pass.at === undefined) return pass;
    const move = script.base.moves.find((m) => m.marker === pass.to);
    if (move && pass.at < move.waypoints.length) return pass;
    changed = true;
    const { at: _dropped, ...rest } = pass;
    void _dropped;
    return rest;
  });
  return changed ? withBase(script, { passes }) : script;
}

/** Drop `after` waits that point at a move or pass no longer in the base Step, and stale catch waypoints. */
function cleanWaits(input: PracticeScript): PracticeScript {
  const script = cleanCatches(input);
  const moved = new Set(script.base.moves.map((m) => m.marker));
  const passIds = new Set(script.base.passes.map((p) => p.id));
  let changed = false;
  const moves = script.base.moves.map((move) => {
    const after = move.after;
    if (!after) return move;
    const broken = (after.move !== undefined && !moved.has(after.move)) || (after.pass !== undefined && !passIds.has(after.pass));
    if (!broken) return move;
    changed = true;
    const { after: _dropped, ...rest } = move;
    void _dropped;
    return rest;
  });
  let passesChanged = false;
  const passes = script.base.passes.map((pass) => {
    if (!pass.after || moved.has(pass.after.move)) return pass;
    passesChanged = true;
    const { after: _dropped, ...rest } = pass;
    void _dropped;
    return rest;
  });
  return changed || passesChanged ? withBase(script, { moves: changed ? moves : script.base.moves, passes: passesChanged ? passes : script.base.passes }) : script;
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
        const holder = nearestCarrier(script, cell, undefined, holdersExcept(script, existing?.id));
        if (!holder) return 'Place a player first: the ball starts in a player’s hands.';
        if (existing) return placeBall(script, existing.id, holder);
        if (script.markers.length >= MAX_MARKERS) return `A Practice holds at most ${MAX_MARKERS} markers.`;
        const id = script.markers.some((m) => m.id === 'ball') ? `ball${nextNumber(script.markers.map((m) => m.id), 'ball')}` : 'ball';
        return placeBall({ ...script, markers: [...script.markers, { id, kind: 'ball' }] }, id, holder);
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
        const holder = nearestCarrier(script, cell, undefined, holdersExcept(script, edit.marker));
        return holder ? placeBall(script, edit.marker, holder) : 'Place a player first: the ball starts in a player’s hands.';
      }
      const current = startCell(script, edit.marker);
      if (current && sameCell(current, cell)) return script;
      const placements = script.base.placements.map((p) => (p.marker === edit.marker ? { marker: p.marker, cell } : p));
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
        waypoints: m.waypoints.map((w, i) => (i === edit.index ? cell : w)),
      }));
    }

    case 'removeWaypoint': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move || !move.waypoints[edit.index]) return script;
      return mapMove(script, edit.marker, (m) =>
        m.waypoints.length === 1 ? null : { ...m, waypoints: m.waypoints.filter((_, i) => i !== edit.index) },
      );
    }

    case 'setPace': {
      const move = script.base.moves.find((m) => m.marker === edit.marker);
      if (!move || (move.pace ?? 'jog') === edit.pace) return script;
      return mapMove(script, edit.marker, (m) => ({ ...m, pace: edit.pace }));
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
      return placeBall({ ...script, markers: [...script.markers, { id, kind: 'ball' }] }, id, edit.holder);
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
      if (holder === undefined) return 'Place the ball first: a pass needs someone holding it.';
      if (edit.from === edit.to) return 'A player cannot pass to themselves.';
      if (!isCarrier(kindOf(script, edit.from)) || !isCarrier(kindOf(script, edit.to))) {
        return 'Only attackers, defenders and coaches pass and receive.';
      }
      if (edit.from !== holder) {
        const label = script.markers.find((m) => m.id === holder)?.label ?? holder;
        return `${label} has the ball at that point, so the next pass must come from ${label}.`;
      }
      if (script.base.passes.length >= MAX_PASSES) return `A Step holds at most ${MAX_PASSES} passes.`;
      const id = `p${nextNumber(script.base.passes.map((p) => p.id), 'p')}`;
      const pass: Pass = { id, from: edit.from, to: edit.to, ...(ball !== balls[0] && { ball }) };
      return withBase(script, { passes: [...script.base.passes, pass] });
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
      const move = script.base.moves.find((m) => m.marker === pass.to);
      const start = startCell(script, pass.to);
      if (!move || !start) return 'The receiver has no run: draw one to catch on the run.';
      const path = [start, ...move.waypoints];
      // Nearest point on the run: project onto each leg, keep the closest.
      let best = { dist: Infinity, leg: 0, x: start.x, y: start.y };
      for (let i = 0; i + 1 < path.length; i++) {
        const a = path[i];
        const b = path[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len2 = dx * dx + dy * dy;
        const t = len2 === 0 ? 0 : Math.min(Math.max(((edit.at.x - a.x) * dx + (edit.at.y - a.y) * dy) / len2, 0), 1);
        const x = a.x + t * dx;
        const y = a.y + t * dy;
        const dist = Math.hypot(edit.at.x - x, edit.at.y - y);
        if (dist < best.dist) best = { dist, leg: i, x, y };
      }
      // Close to a waypoint: catch there instead of adding another.
      let near = -1;
      let nearDist = CATCH_SNAP_CELLS;
      move.waypoints.forEach((w, i) => {
        const d = Math.hypot(best.x - w.x, best.y - w.y);
        if (d <= nearDist) {
          near = i;
          nearDist = d;
        }
      });
      if (near === move.waypoints.length - 1) return applyEdit(script, { type: 'setCatch', id: edit.id, at: null });
      if (near >= 0) return applyEdit(script, { type: 'setCatch', id: edit.id, at: near });
      const cell = snapCell({ x: best.x, y: best.y }, area);
      if (sameCell(cell, start)) return 'Tap further along the run to catch there.';
      if (move.waypoints.length >= MAX_WAYPOINTS) return `A run holds at most ${MAX_WAYPOINTS} waypoints.`;
      // The new waypoint sits at index `leg`; later waypoints, and catches at them, shift up one.
      const index = best.leg;
      const moves = script.base.moves.map((m) =>
        m === move ? { ...m, waypoints: [...m.waypoints.slice(0, index), cell, ...m.waypoints.slice(index)] } : m,
      );
      const passes = script.base.passes.map((p) => {
        if (p.id === edit.id) return { ...p, at: index };
        return p.to === pass.to && p.at !== undefined && p.at >= index ? { ...p, at: p.at + 1 } : p;
      });
      return withBase(script, { moves, passes });
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
  }
}

/**
 * Refuse an edit that turns a valid script into an invalid one (typically by
 * breaking a change in a later Progression). Emptying the script is allowed:
 * that is a fresh start, not a broken Practice.
 */
function keepValid(before: PracticeScript, after: PracticeScript | string, refusal: string): PracticeScript | string {
  if (typeof after === 'string' || after === before || after.markers.length === 0) return after;
  const result = validate(after);
  if (result.ok || !validate(before).ok) return after;
  return `${refusal}: ${formatError(result.errors[0])}`;
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
        m.holder !== undefined ? { marker: m.id, holder: m.holder } : { marker: m.id, cell: m.cell },
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

function startOf(placement: Placement): { cell: Cell } | { holder: string } {
  return placement.holder !== undefined ? { holder: placement.holder } : { cell: placement.cell! };
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
const BREAKS_LATER_STEP = 'That would break a later Step';

/**
 * Rewrite Progression n (Step n, n >= 1) by editing its resolved state, then
 * storing the difference from Step n - 1 as its changes. The base and earlier
 * Steps are untouched; later Steps carry the result forward.
 */
function editProgression(
  script: PracticeScript,
  n: number,
  edit: (step: PracticeScript) => PracticeScript | string,
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
  const next = pruneMarkers({
    ...script,
    markers: [...script.markers, ...edited.markers.filter((m) => !declared.has(m.id))],
    progressions: script.progressions.map((p, i) => (i === n - 1 ? { ...p, changes: diffSteps(prev, edited) } : p)),
  });
  return keepValid(script, next, BREAKS_LATER_STEP);
}

/**
 * Apply one edit to Step n: the base Step (n = 0) directly, or a Progression by
 * recording the edit as that Progression's changes. Refuses an edit that would
 * break a later Step. Returns the new script, the same script for a no-op, or
 * a message saying why it cannot be made.
 */
export function applyStepEdit(script: PracticeScript, n: number, edit: Edit): PracticeScript | string {
  if (n === 0) return keepValid(script, applyEdit(script, edit), BREAKS_LATER_STEP);
  return editProgression(script, n, (step) => applyEdit(step, edit));
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
  if (progression.lever !== 'space') {
    return 'Only a Progression that pulls the Space lever can change the Area. Set its Lever to Space first.';
  }
  return editProgression(script, n, (step) => (same(step.area, area) ? step : { ...step, area }));
}

/** Set the Direction of attack of the whole Practice. */
export function applyDirection(script: PracticeScript, direction: Direction): PracticeScript {
  return script.direction === direction ? script : { ...script, direction };
}

/** Add an empty Progression after the last Step. */
export function addProgression(script: PracticeScript, lever: Lever): PracticeScript {
  return { ...script, progressions: [...script.progressions, { lever, commentary: { points: [] }, changes: [] }] };
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

/** Change the Lever of Progression n (Step n). */
export function setLever(script: PracticeScript, n: number, lever: Lever): PracticeScript | string {
  const progression = script.progressions[n - 1];
  if (!progression) return stepMissing(n);
  if (progression.lever === lever) return script;
  const progressions = script.progressions.map((p, i) => (i === n - 1 ? { ...p, lever } : p));
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
