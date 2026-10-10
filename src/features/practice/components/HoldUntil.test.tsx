// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { applyEdit, emptyScript, waitOptions, type Edit } from '@/features/practice/editing';
import { resolveStep } from '@/features/practice/engine';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import type { PracticeScript } from '@/features/practice/schema';
import { SelectionPanel } from './SelectionPanel';
import { PracticeEditLayer } from './PracticeEditLayer';

vi.mock('react-konva', () => {
  const el = (name: string) => {
    const C = ({ children, name: className }: { children?: React.ReactNode; name?: string }) => (
      <div data-konva={name} data-name={className}>{children}</div>
    );
    return C;
  };
  return { Layer: el('Layer'), Rect: el('Rect'), Circle: el('Circle'), Group: el('Group'), Text: el('Text'), Line: el('Line'), RegularPolygon: el('RegularPolygon') };
});

(globalThis as { React?: typeof React }).React = React;

const build = (script: PracticeScript, edits: Edit[]) =>
  edits.reduce((s, e) => {
    const r = applyEdit(s, e);
    if (typeof r === 'string') throw new Error(r);
    return r;
  }, script);

const base = build(emptyScript(), [
  { type: 'addMarker', kind: 'attacker', at: { x: 2, y: 18 } },
  { type: 'addMarker', kind: 'attacker', at: { x: 8, y: 18 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 15 } },
  { type: 'addWaypoint', marker: 'a1', at: { x: 2, y: 12 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 15 } },
  { type: 'addWaypoint', marker: 'a2', at: { x: 8, y: 10 } },
]);

function panel(script: PracticeScript, onEdit: (e: Edit) => void) {
  const step = resolveStep(script, 0);
  const workspace = {
    editing: true,
    playing: false,
    shownStep: 0,
    script,
    step,
    selectedMarker: step.markers.find((m) => m.id === 'a1'),
    selectedMove: step.moves.find((m) => m.marker === 'a1'),
    selection: { marker: 'a1', waypoint: 1 },
    balls: [],
    passes: [],
    tool: 'run',
    passKind: 'pass',
    edit: (e: Edit) => {
      onEdit(e);
      return true;
    },
  } as unknown as EditorWorkspace;
  return <SelectionPanel workspace={workspace} hint="" />;
}

describe('Hold until picker', () => {
  afterEach(cleanup);

  it('offers no choice that would loop, nor a run waiting on itself', () => {
    const step = resolveStep(base, 0);
    const options = waitOptions(base, step, { hold: { marker: 'a1', index: 1 } });
    expect(options).toContainEqual({ move: 'a2' });
    expect(options).toContainEqual({ reach: { marker: 'a2', waypoint: 0 } });
    expect(options).not.toContainEqual({ move: 'a1' });
    // a2 already starts when a1 reaches its second point, so a1 cannot hold at its first point on a2.
    const loopy = build(base, [{ type: 'setStartAfter', marker: 'a2', wait: { reach: { marker: 'a1', waypoint: 1 } } }]);
    const loopOptions = waitOptions(loopy, resolveStep(loopy, 0), { hold: { marker: 'a1', index: 0 } });
    expect(loopOptions).not.toContainEqual({ move: 'a2' });
  });

  it('sets, changes and removes a hold from the panel', () => {
    const onEdit = vi.fn();
    const { rerender } = render(panel(base, onEdit));
    const select = screen.getByRole('combobox', { name: 'Hold until' }) as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(screen.getByRole('option', { name: 'No hold' })).toBeTruthy();
    fireEvent.change(select, { target: { value: 'reach:a2:1' } });
    expect(onEdit).toHaveBeenLastCalledWith({ type: 'setWaypointHold', marker: 'a1', index: 1, hold: { reach: { marker: 'a2', waypoint: 1 } } });

    const held = build(base, [{ type: 'setWaypointHold', marker: 'a1', index: 1, hold: { move: 'a2' } }]);
    rerender(panel(held, onEdit));
    const heldSelect = screen.getByRole('combobox', { name: 'Hold until' }) as HTMLSelectElement;
    expect(heldSelect.value).toBe('move:a2');
    fireEvent.change(heldSelect, { target: { value: 'reach:a2:0' } });
    expect(onEdit).toHaveBeenLastCalledWith({ type: 'setWaypointHold', marker: 'a1', index: 1, hold: { reach: { marker: 'a2', waypoint: 0 } } });
    fireEvent.change(heldSelect, { target: { value: '' } });
    expect(onEdit).toHaveBeenLastCalledWith({ type: 'setWaypointHold', marker: 'a1', index: 1, hold: null });
  });
});

describe('pause badge', () => {
  afterEach(cleanup);

  it('is drawn only on waypoints that hold', () => {
    const held = build(base, [{ type: 'setWaypointHold', marker: 'a1', index: 1, hold: { move: 'a2' } }]);
    const geometry = { width: 400, height: 800, cellPx: 20, radius: 8 } as never;
    const layer = (script: PracticeScript) => (
      <PracticeEditLayer
        step={resolveStep(script, 0)}
        geometry={geometry}
        tool="run"
        selection={{ marker: 'a1', waypoint: null }}
        onSelect={() => {}}
        onEdit={() => true}
      />
    );
    const { container, rerender } = render(layer(base));
    expect(container.querySelectorAll('[data-name="hold-badge"]').length).toBe(0);
    rerender(layer(held));
    expect(container.querySelectorAll('[data-name="hold-badge"]').length).toBe(1);
  });
});
