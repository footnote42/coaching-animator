import { describe, it, expect } from 'vitest';
import {
  addProgression,
  applyEdit,
  applyStepArea,
  applyStepEdit,
  editScript,
  editorReducer,
  emptyScript,
  initialEditorState,
  moveProgression,
  removeProgression,
  setCommentary,
  setLever,
  snapCell,
  type Edit,
  type EditorState,
} from '@/features/practice/editing';
import { resolveStep, validate } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';

function ok(result: PracticeScript | string): PracticeScript {
  if (typeof result === 'string') throw new Error(result);
  return result;
}

function edits(script: PracticeScript, ...list: Edit[]): PracticeScript {
  return list.reduce((s, edit) => ok(applyEdit(s, edit)), script);
}

/** Apply edits to Step n through applyStepEdit. */
function stepEdits(script: PracticeScript, n: number, ...list: Edit[]): PracticeScript {
  return list.reduce((s, edit) => ok(applyStepEdit(s, n, edit)), script);
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

  it('setLabel sets, clears, trims and ignores unknown markers', () => {
    let script = edits(emptyScript(), { type: 'addMarker', kind: 'attacker', at: at(5, 5) });
    expect(script.markers[0].label).toBe('A1');

    // set
    script = edits(script, { type: 'setLabel', marker: 'a1', label: '10' });
    expect(script.markers[0].label).toBe('10');
    expect(validate(script).ok).toBe(true);

    // set whitespace-only clears it (and truncates undefined)
    script = edits(script, { type: 'setLabel', marker: 'a1', label: '   ' });
    expect(script.markers[0].label).toBeUndefined();
    expect(validate(script).ok).toBe(true);

    // explicit undefined clears
    script = edits(script, { type: 'setLabel', marker: 'a1', label: 'X' });
    script = edits(script, { type: 'setLabel', marker: 'a1', label: undefined });
    expect(script.markers[0].label).toBeUndefined();

    // >4 chars rejected by validate
    script = edits(script, { type: 'setLabel', marker: 'a1', label: '12345' });
    expect(validate(script).ok).toBe(false);

    // unknown marker no-op
    script = edits(script, { type: 'setLabel', marker: 'unknown', label: 'Y' });
    expect(script.markers.length).toBe(1);
    expect(script.markers[0].label).toBe('12345');
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

  it('sets a catch on the run, and drops it when the run no longer reaches it', () => {
    const passed = edits(base, { type: 'addPass', from: 'a1', to: 'a2' });
    expect(typeof applyEdit(passed, { type: 'setCatch', id: 'p1', at: 0 })).toBe('string');
    let script = edits(
      passed,
      { type: 'addWaypoint', marker: 'a2', at: at(8, 5) },
      { type: 'addWaypoint', marker: 'a2', at: at(8, 9) },
      { type: 'setCatch', id: 'p1', at: 1 },
    );
    expect(script.base.passes).toEqual([{ id: 'p1', from: 'a1', to: 'a2', at: 1 }]);
    expect(validate(script).ok).toBe(true);
    expect(edits(script, { type: 'setCatch', id: 'p1', at: null }).base.passes).toEqual([{ id: 'p1', from: 'a1', to: 'a2' }]);
    script = edits(script, { type: 'removeWaypoint', marker: 'a2', index: 1 });
    expect(script.base.passes).toEqual([{ id: 'p1', from: 'a1', to: 'a2' }]);
    expect(validate(script).ok).toBe(true);
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

const cellOf = (script: PracticeScript, n: number, id: string) =>
  resolveStep(script, n).markers.find((m) => m.id === id)?.cell;

describe('Progressions: editing inside a Step', () => {
  const base = edits(
    emptyScript(),
    { type: 'addMarker', kind: 'attacker', at: at(1, 1) },
    { type: 'addMarker', kind: 'attacker', at: at(8, 1) },
    { type: 'addMarker', kind: 'ball', at: at(1, 1) },
    { type: 'addWaypoint', marker: 'a1', at: at(1, 5) },
    { type: 'addPass', from: 'a1', to: 'a2' },
  );

  it('adds an empty Progression with a Lever after the last Step, and it validates', () => {
    const script = addProgression(base, 'people');
    expect(script.progressions).toEqual([{ lever: 'people', commentary: { points: [] }, changes: [] }]);
    expect(validate(script).ok).toBe(true);
    expect(resolveStep(script, 1).markers).toEqual(resolveStep(script, 0).markers);
  });

  it('records a drag as one placeMarker, coalescing repeated drags; the base is untouched', () => {
    const script = stepEdits(
      addProgression(base, 'space'),
      1,
      { type: 'moveMarker', marker: 'a2', at: at(5, 5) },
      { type: 'moveMarker', marker: 'a2', at: at(6, 6) },
    );
    expect(script.progressions[0].changes).toEqual([{ type: 'placeMarker', marker: 'a2', cell: { x: 6, y: 6 } }]);
    expect(script.base).toEqual(base.base);
    expect(cellOf(script, 0, 'a2')).toEqual({ x: 8, y: 1 });
    expect(cellOf(script, 1, 'a2')).toEqual({ x: 6, y: 6 });
    expect(validate(script).ok).toBe(true);
  });

  it('records adding a marker as addMarker and declares it once', () => {
    const script = stepEdits(addProgression(base, 'people'), 1, { type: 'addMarker', kind: 'defender', at: at(4, 8) });
    expect(script.markers.map((m) => m.id)).toEqual(['a1', 'a2', 'ball', 'd1']);
    expect(script.progressions[0].changes).toEqual([{ type: 'addMarker', marker: 'd1', cell: { x: 4, y: 8 } }]);
    expect(resolveStep(script, 0).markers.map((m) => m.id)).not.toContain('d1');
    expect(validate(script).ok).toBe(true);
  });

  it('a marker added then removed in the same Progression leaves no change and no declaration', () => {
    const script = stepEdits(
      addProgression(base, 'people'),
      1,
      { type: 'addMarker', kind: 'defender', at: at(4, 8) },
      { type: 'removeMarker', marker: 'd1' },
    );
    expect(script.progressions[0].changes).toEqual([]);
    expect(script.markers.map((m) => m.id)).toEqual(['a1', 'a2', 'ball']);
  });

  it('records removing a marker as removeMarker, with its broken passes removed', () => {
    const script = stepEdits(addProgression(base, 'people'), 1, { type: 'removeMarker', marker: 'a2' });
    expect(script.progressions[0].changes).toEqual([
      { type: 'removeMarker', marker: 'a2' },
      { type: 'removePass', id: 'p1' },
    ]);
    expect(script.base).toEqual(base.base);
    expect(validate(script).ok).toBe(true);
  });

  it('records runs and Pace as one setMove per marker, and deleting a run as removeMove', () => {
    let script = stepEdits(
      addProgression(base, 'time'),
      1,
      { type: 'addWaypoint', marker: 'a1', at: at(4, 5) },
      { type: 'setPace', marker: 'a1', pace: 'sprint' },
      { type: 'addWaypoint', marker: 'a2', at: at(8, 6) },
    );
    expect(script.progressions[0].changes).toEqual([
      { type: 'setMove', marker: 'a1', waypoints: [{ x: 1, y: 5 }, { x: 4, y: 5 }], pace: 'sprint' },
      { type: 'setMove', marker: 'a2', waypoints: [{ x: 8, y: 6 }] },
    ]);
    expect(script.base.moves).toEqual(base.base.moves);
    script = stepEdits(script, 1, { type: 'removeMove', marker: 'a1' }, { type: 'removeMove', marker: 'a2' });
    expect(script.progressions[0].changes).toEqual([{ type: 'removeMove', marker: 'a1' }]);
    expect(validate(script).ok).toBe(true);
  });

  it('records passes as setPass and removePass, keeping play order', () => {
    let script = stepEdits(addProgression(base, 'people'), 1, { type: 'addPass', from: 'a2', to: 'a1' });
    expect(script.progressions[0].changes).toEqual([{ type: 'setPass', id: 'p2', from: 'a2', to: 'a1' }]);
    expect(resolveStep(script, 1).passes.map((p) => p.id)).toEqual(['p1', 'p2']);
    script = stepEdits(script, 1, { type: 'removePass', id: 'p1' });
    expect(script.progressions[0].changes).toEqual([{ type: 'removePass', id: 'p1' }]);
    expect(resolveStep(script, 1).passes).toEqual([]);
    expect(validate(script).ok).toBe(true);
  });

  it('records a catch on the run in a Progression as setPass with its waypoint', () => {
    const script = stepEdits(
      addProgression(base, 'time'),
      1,
      { type: 'addWaypoint', marker: 'a2', at: at(8, 4) },
      { type: 'addWaypoint', marker: 'a2', at: at(8, 8) },
      { type: 'setCatch', id: 'p1', at: 0 },
    );
    expect(script.progressions[0].changes).toEqual([
      { type: 'setMove', marker: 'a2', waypoints: [{ x: 8, y: 4 }, { x: 8, y: 8 }] },
      { type: 'setPass', id: 'p1', from: 'a1', to: 'a2', at: 0 },
    ]);
    expect(script.base.passes).toEqual(base.base.passes);
    expect(validate(script).ok).toBe(true);
    const back = stepEdits(script, 1, { type: 'setCatch', id: 'p1', at: null });
    expect(back.progressions[0].changes).toEqual([script.progressions[0].changes[0]]);
  });

  it('a no-op edit in a Progression returns the same script', () => {
    const script = addProgression(base, 'people');
    expect(applyStepEdit(script, 1, { type: 'moveMarker', marker: 'a2', at: at(8, 1) })).toBe(script);
  });

  it('an edit to a middle Progression leaves earlier Steps alone and carries into later ones', () => {
    const chain = addProgression(addProgression(base, 'people'), 'space');
    const script = stepEdits(chain, 1, { type: 'moveMarker', marker: 'a2', at: at(6, 3) });
    expect(script.progressions[1].changes).toEqual([]);
    expect(cellOf(script, 0, 'a2')).toEqual({ x: 8, y: 1 });
    expect(cellOf(script, 2, 'a2')).toEqual({ x: 6, y: 3 });
  });

  it('base edits appear in every later Step that has not overridden them', () => {
    let script = stepEdits(addProgression(addProgression(base, 'people'), 'space'), 2, {
      type: 'moveMarker',
      marker: 'a2',
      at: at(9, 9),
    });
    script = stepEdits(
      script,
      0,
      { type: 'moveMarker', marker: 'a2', at: at(3, 3) },
      { type: 'addMarker', kind: 'cone', at: at(0, 0) },
    );
    expect(cellOf(script, 1, 'a2')).toEqual({ x: 3, y: 3 });
    expect(cellOf(script, 2, 'a2')).toEqual({ x: 9, y: 9 });
    expect(resolveStep(script, 2).markers.map((m) => m.id)).toContain('cone1');
  });

  it('refuses a base edit that would break a later Step', () => {
    const script = stepEdits(addProgression(base, 'people'), 1, { type: 'moveMarker', marker: 'a2', at: at(5, 5) });
    expect(applyStepEdit(script, 0, { type: 'removeMarker', marker: 'a2' })).toMatch(/later Step/);
  });
});

describe('Progressions: Area', () => {
  const base = edits(emptyScript(), { type: 'addMarker', kind: 'attacker', at: at(1, 1) });

  it('turns an Area change in a Space Progression into a setArea change', () => {
    const script = ok(applyStepArea(addProgression(base, 'space'), 1, { width: 30, length: 10 }));
    expect(script.area).toEqual(base.area);
    expect(script.progressions[0].changes).toEqual([{ type: 'setArea', width: 30, length: 10 }]);
    expect(resolveStep(script, 1).area).toEqual({ width: 30, length: 10 });
    expect(validate(script).ok).toBe(true);
  });

  it('refuses an Area change in a Progression that does not pull the Space lever', () => {
    expect(typeof applyStepArea(addProgression(base, 'people'), 1, { width: 30, length: 10 })).toBe('string');
  });

  it('refuses an Area that leaves a marker outside it', () => {
    const script = edits(base, { type: 'moveMarker', marker: 'a1', at: at(15, 15) });
    expect(typeof applyStepArea(addProgression(script, 'space'), 1, { width: 10, length: 10 })).toBe('string');
  });
});

describe('Progressions: reorder, delete, Lever and Commentary', () => {
  const base = edits(
    emptyScript(),
    { type: 'addMarker', kind: 'attacker', at: at(1, 1) },
    { type: 'addMarker', kind: 'attacker', at: at(8, 1) },
  );
  const withDefender = stepEdits(addProgression(base, 'people'), 1, { type: 'addMarker', kind: 'defender', at: at(4, 8) });
  const chain = stepEdits(addProgression(withDefender, 'space'), 2, { type: 'moveMarker', marker: 'd1', at: at(4, 4) });

  it('moves an independent Progression up and down; the chain re-resolves', () => {
    const script = addProgression(withDefender, 'time');
    const moved = ok(moveProgression(script, 2, -1));
    expect(moved.progressions.map((p) => p.lever)).toEqual(['time', 'people']);
    expect(resolveStep(moved, 1).markers.map((m) => m.id)).not.toContain('d1');
    expect(ok(moveProgression(moved, 1, 1)).progressions.map((p) => p.lever)).toEqual(['people', 'time']);
    expect(moveProgression(moved, 1, -1)).toBe(moved);
  });

  it('refuses a reorder or delete that breaks a later change', () => {
    expect(moveProgression(chain, 2, -1)).toMatch(/can’t move/);
    expect(removeProgression(chain, 1)).toMatch(/can’t be deleted/);
  });

  it('deletes a Progression and drops markers only it added', () => {
    const script = ok(removeProgression(withDefender, 1));
    expect(script.progressions).toEqual([]);
    expect(script.markers.map((m) => m.id)).toEqual(['a1', 'a2']);
    expect(validate(script).ok).toBe(true);
  });

  it('changes the Lever, but not away from Space while the Step changes the Area', () => {
    expect(ok(setLever(withDefender, 1, 'equipment')).progressions[0].lever).toBe('equipment');
    const resized = ok(applyStepArea(addProgression(base, 'space'), 1, { width: 25, length: 20 }));
    expect(typeof setLever(resized, 1, 'time')).toBe('string');
  });

  it('edits Commentary points for the base and each Progression', () => {
    let script = ok(setCommentary(withDefender, 0, ['Hands up early', '  ']));
    expect(script.base.commentary.points).toEqual(['Hands up early']);
    script = ok(setCommentary(script, 1, ['A defender adds pressure', 'Scan before you pass']));
    expect(script.progressions[0].commentary.points).toEqual(['A defender adds pressure', 'Scan before you pass']);
    script = ok(setCommentary(script, 1, ['A defender adds pressure']));
    expect(resolveStep(script, 1).commentary.points).toEqual(['A defender adds pressure']);
    expect(setCommentary(script, 1, ['A defender adds pressure'])).toBe(script);
    expect(typeof setCommentary(script, 1, Array.from({ length: 11 }, (_, i) => `p${i}`))).toBe('string');
    expect(validate(script).ok).toBe(true);
  });

  it('undo and redo cover Progression edits', () => {
    let state = initialEditorState(base);
    const commit = (next: PracticeScript | string) => {
      state = editorReducer(state, { type: 'commit', script: ok(next) });
    };
    commit(addProgression(state.script, 'people'));
    commit(applyStepEdit(state.script, 1, { type: 'addMarker', kind: 'defender', at: at(4, 8) }));
    commit(setCommentary(state.script, 1, ['Defender']));
    commit(setLever(state.script, 1, 'equipment'));
    commit(removeProgression(state.script, 1));
    expect(state.script.progressions).toEqual([]);
    state = editorReducer(state, { type: 'undo' });
    expect(state.script.progressions[0].lever).toBe('equipment');
    state = editorReducer(editorReducer(state, { type: 'undo' }), { type: 'undo' });
    expect(state.script.progressions[0].commentary.points).toEqual([]);
    state = editorReducer(state, { type: 'undo' });
    expect(state.script.progressions[0].changes).toEqual([]);
    state = editorReducer(state, { type: 'redo' });
    expect(state.script.progressions[0].changes).toHaveLength(1);
  });
});
