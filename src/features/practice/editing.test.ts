import { describe, it, expect } from 'vitest';
import {
  applyEdit,
  editScript,
  editorReducer,
  emptyScript,
  initialEditorState,
  snapCell,
  type Edit,
  type EditorState,
} from '@/features/practice/editing';
import { validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function edits(script: PracticeScript, ...list: Edit[]): PracticeScript {
  return list.reduce((s, edit) => {
    const next = applyEdit(s, edit);
    if (typeof next === 'string') throw new Error(next);
    return next;
  }, script);
}

const at = (x: number, y: number) => ({ x, y });

describe('snapCell', () => {
  it('rounds to the nearest cell and keeps it inside the Area', () => {
    const area = { width: 10, length: 6 };
    expect(snapCell(at(2.4, 3.6), area)).toEqual({ x: 2, y: 4 });
    expect(snapCell(at(-3, 99), area)).toEqual({ x: 0, y: 5 });
  });
});

describe('applyEdit: markers', () => {
  it('adds markers on snapped cells with default ids and labels', () => {
    const script = edits(
      emptyScript(),
      { type: 'addMarker', kind: 'attacker', at: at(2.2, 3.7) },
      { type: 'addMarker', kind: 'attacker', at: at(5, 5) },
      { type: 'addMarker', kind: 'defender', at: at(8, 8) },
      { type: 'addMarker', kind: 'cone', at: at(0, 0) },
    );
    expect(script.markers).toEqual([
      { id: 'a1', kind: 'attacker', label: 'A1' },
      { id: 'a2', kind: 'attacker', label: 'A2' },
      { id: 'd1', kind: 'defender', label: 'D1' },
      { id: 'cone1', kind: 'cone' },
    ]);
    expect(script.base.placements[0]).toEqual({ marker: 'a1', cell: { x: 2, y: 4 } });
    expect(validate(script).ok).toBe(true);
  });

  it('puts the ball in the hands of the nearest player', () => {
    const script = edits(
      emptyScript(),
      { type: 'addMarker', kind: 'attacker', at: at(2, 2) },
      { type: 'addMarker', kind: 'attacker', at: at(10, 10) },
      { type: 'addMarker', kind: 'ball', at: at(9, 9) },
    );
    expect(script.base.placements).toContainEqual({ marker: 'ball', holder: 'a2' });
    expect(validate(script).ok).toBe(true);
  });

  it('refuses a ball with no player to hold it', () => {
    expect(typeof applyEdit(emptyScript(), { type: 'addMarker', kind: 'ball', at: at(1, 1) })).toBe('string');
  });

  it('snaps a dragged marker to the nearest cell', () => {
    const script = edits(emptyScript(), { type: 'addMarker', kind: 'attacker', at: at(1, 1) });
    const moved = edits(script, { type: 'moveMarker', marker: 'a1', at: at(6.6, 3.2) });
    expect(moved.base.placements[0]).toEqual({ marker: 'a1', cell: { x: 7, y: 3 } });
  });

  it('returns the same script when a drag lands on the same cell', () => {
    const script = edits(emptyScript(), { type: 'addMarker', kind: 'attacker', at: at(1, 1) });
    expect(applyEdit(script, { type: 'moveMarker', marker: 'a1', at: at(1.3, 0.8) })).toBe(script);
  });

  it('removing the ball holder hands the ball to the nearest player and drops broken passes', () => {
    const script = edits(
      emptyScript(),
      { type: 'addMarker', kind: 'attacker', at: at(1, 1) },
      { type: 'addMarker', kind: 'attacker', at: at(5, 1) },
      { type: 'addMarker', kind: 'ball', at: at(1, 1) },
      { type: 'addPass', from: 'a1', to: 'a2' },
      { type: 'removeMarker', marker: 'a1' },
    );
    expect(script.base.placements).toContainEqual({ marker: 'ball', holder: 'a2' });
    expect(script.base.passes).toEqual([]);
    expect(validate(script).ok).toBe(true);
  });
});

describe('applyEdit: runs and passes', () => {
  const base = edits(
    emptyScript(),
    { type: 'addMarker', kind: 'attacker', at: at(1, 1) },
    { type: 'addMarker', kind: 'attacker', at: at(8, 1) },
    { type: 'addMarker', kind: 'ball', at: at(1, 1) },
  );

  it('draws, moves and deletes waypoints, and sets Pace', () => {
    let script = edits(
      base,
      { type: 'addWaypoint', marker: 'a1', at: at(1, 5) },
      { type: 'addWaypoint', marker: 'a1', at: at(4, 5) },
      { type: 'moveWaypoint', marker: 'a1', index: 0, at: at(2.4, 6.4) },
      { type: 'setPace', marker: 'a1', pace: 'sprint' },
    );
    expect(script.base.moves).toEqual([
      { marker: 'a1', waypoints: [{ x: 2, y: 6 }, { x: 4, y: 5 }], pace: 'sprint' },
    ]);
    expect(validate(script).ok).toBe(true);
    script = edits(script, { type: 'removeWaypoint', marker: 'a1', index: 1 });
    expect(script.base.moves[0].waypoints).toEqual([{ x: 2, y: 6 }]);
    script = edits(script, { type: 'removeWaypoint', marker: 'a1', index: 0 });
    expect(script.base.moves).toEqual([]);
  });

  it('refuses a run for the ball', () => {
    expect(typeof applyEdit(base, { type: 'addWaypoint', marker: 'ball', at: at(3, 3) })).toBe('string');
  });

  it('adds passes only from whoever has the ball, and chains them', () => {
    expect(typeof applyEdit(base, { type: 'addPass', from: 'a2', to: 'a1' })).toBe('string');
    const script = edits(base, { type: 'addPass', from: 'a1', to: 'a2' }, { type: 'addPass', from: 'a2', to: 'a1' });
    expect(script.base.passes).toEqual([
      { id: 'p1', from: 'a1', to: 'a2' },
      { id: 'p2', from: 'a2', to: 'a1' },
    ]);
    expect(validate(script).ok).toBe(true);
    const removed = edits(script, { type: 'removePass', id: 'p1' });
    expect(removed.base.passes).toEqual([]);
  });
});

describe('editorReducer: undo and redo', () => {
  it('steps through whole-script snapshots', () => {
    let state: EditorState = initialEditorState();
    const first = editScript(state, { type: 'addMarker', kind: 'attacker', at: at(1, 1) });
    state = first.state;
    state = editScript(state, { type: 'moveMarker', marker: 'a1', at: at(4, 4) }).state;
    const afterMove = state.script;
    expect(state.past).toHaveLength(2);

    state = editorReducer(state, { type: 'undo' });
    expect(state.script).toBe(first.state.script);
    state = editorReducer(state, { type: 'undo' });
    expect(state.script.markers).toEqual([]);
    expect(editorReducer(state, { type: 'undo' })).toBe(state);

    state = editorReducer(state, { type: 'redo' });
    state = editorReducer(state, { type: 'redo' });
    expect(state.script).toBe(afterMove);
    expect(editorReducer(state, { type: 'redo' })).toBe(state);
  });

  it('a new edit clears redo; a no-op or refused edit leaves history alone', () => {
    let state = editScript(initialEditorState(), { type: 'addMarker', kind: 'attacker', at: at(1, 1) }).state;
    state = editorReducer(state, { type: 'undo' });
    state = editScript(state, { type: 'addMarker', kind: 'defender', at: at(2, 2) }).state;
    expect(state.future).toEqual([]);

    const same = editScript(state, { type: 'moveMarker', marker: 'd1', at: at(2, 2) });
    expect(same.state).toBe(state);
    const refused = editScript(state, { type: 'addPass', from: 'd1', to: 'd1' });
    expect(refused.error).toBeTruthy();
    expect(refused.state).toBe(state);
  });

  it('load resets the history', () => {
    const state = editScript(initialEditorState(), { type: 'addMarker', kind: 'cone', at: at(1, 1) }).state;
    const loaded = editorReducer(state, { type: 'load', script: emptyScript() });
    expect(loaded.past).toEqual([]);
    expect(loaded.future).toEqual([]);
  });
});
