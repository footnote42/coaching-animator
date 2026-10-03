/**
 * Hand editing of a Practice Script: pure edits over the base Step plus an
 * undo/redo history of whole-script snapshots. The editor writes the same
 * Practice Script an agent writes (ADR 0002), so every edit keeps the script
 * shaped by the schema and snaps positions to grid cells.
 */
import {
  BALL_CARRIER_KINDS,
  MAX_MARKERS,
  MAX_PASSES,
  MAX_WAYPOINTS,
  SCHEMA_VERSION,
  type Area,
  type Cell,
  type Marker,
  type MarkerKind,
  type Move,
  type Pace,
  type Pass,
  type PracticeScript,
} from '@/features/practice/schema';

/** A point in cell units; fractions allowed (a drop between cells). */
export interface CellPoint {
  x: number;
  y: number;
}

/** One hand edit of the base Step. Positions are snapped to the nearest cell. */
export type Edit =
  | { type: 'addMarker'; kind: MarkerKind; at: CellPoint }
  | { type: 'moveMarker'; marker: string; at: CellPoint }
  | { type: 'removeMarker'; marker: string }
  | { type: 'addWaypoint'; marker: string; at: CellPoint }
  | { type: 'moveWaypoint'; marker: string; index: number; at: CellPoint }
  | { type: 'removeWaypoint'; marker: string; index: number }
  | { type: 'setPace'; marker: string; pace: Pace }
  | { type: 'removeMove'; marker: string }
  | { type: 'addPass'; from: string; to: string }
  | { type: 'removePass'; id: string };

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

/** Id of the ball's holder at the start of the base Step, if there is a ball. */
export function ballHolder(script: PracticeScript): string | undefined {
  const ball = script.markers.find((m) => m.kind === 'ball');
  return ball && script.base.placements.find((p) => p.marker === ball.id)?.holder;
}

/** Who holds the ball once every base pass has been caught. */
export function holderAfterPasses(script: PracticeScript): string | undefined {
  const last = script.base.passes[script.base.passes.length - 1];
  return last ? last.to : ballHolder(script);
}

/** Nearest placed attacker, defender or coach to a cell, skipping `except`. */
function nearestCarrier(script: PracticeScript, cell: Cell, except?: string): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const p of script.base.placements) {
    if (p.marker === except || !p.cell || !isCarrier(kindOf(script, p.marker))) continue;
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
 * Keep only passes that still chain from the ball's holder: each must come from
 * whoever holds the ball when it fires and go to another carrier.
 */
export function repairPasses(script: PracticeScript): PracticeScript {
  let holder = ballHolder(script);
  const passes: Pass[] = [];
  for (const pass of script.base.passes) {
    if (holder === undefined) break;
    if (pass.from !== holder || pass.to === pass.from || !isCarrier(kindOf(script, pass.to))) continue;
    if (!script.base.placements.some((p) => p.marker === pass.to)) continue;
    passes.push(pass);
    holder = pass.to;
  }
  if (passes.length === script.base.passes.length) return script;
  return cleanWaits(withBase(script, { passes }));
}

/** Drop `after` waits that point at a move or pass no longer in the base Step. */
function cleanWaits(script: PracticeScript): PracticeScript {
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
  return changed ? withBase(script, { moves }) : script;
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
        const holder = nearestCarrier(script, cell);
        if (!holder) return 'Place a player first: the ball starts in a player’s hands.';
        const existing = script.markers.find((m) => m.kind === 'ball');
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
        const holder = nearestCarrier(script, cell);
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
          passes: kind === 'ball' ? [] : script.base.passes,
        },
      };
      const ball = next.markers.find((m) => m.kind === 'ball');
      if (ball && ballHolder(script) === edit.marker) {
        const holder = nearestCarrier(next, startCell(script, edit.marker)!);
        next = holder
          ? withBase(next, { placements: next.base.placements.map((p) => (p.marker === ball.id ? { marker: ball.id, holder } : p)) })
          : {
              ...next,
              markers: next.markers.filter((m) => m.id !== ball.id),
              base: { ...next.base, placements: next.base.placements.filter((p) => p.marker !== ball.id), passes: [] },
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

    case 'removeMove':
      if (!script.base.moves.some((m) => m.marker === edit.marker)) return script;
      return mapMove(script, edit.marker, () => null);

    case 'addPass': {
      const holder = holderAfterPasses(script);
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
      return withBase(script, { passes: [...script.base.passes, { id, from: edit.from, to: edit.to }] });
    }

    case 'removePass': {
      if (!script.base.passes.some((p) => p.id === edit.id)) return script;
      return repairPasses(withBase(script, { passes: script.base.passes.filter((p) => p.id !== edit.id) }));
    }
  }
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
