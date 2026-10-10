// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { SelectionPanel, getToolHelp } from '@/features/practice/components/SelectionPanel';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import type { EditorTool } from '@/features/practice/editing';

(globalThis as { React?: typeof React }).React = React;

afterEach(cleanup);

function mockWorkspace(overrides: Partial<EditorWorkspace> = {}): EditorWorkspace {
  return {
    editing: true,
    playing: false,
    shownStep: 0,
    selectedMarker: undefined,
    selectedMove: undefined,
    selection: { marker: null, waypoint: null },
    balls: [],
    passes: [],
    carriedBall: undefined,
    tool: 'select' as EditorTool,
    passKind: 'pass',
    startPass: () => {},
    edit: () => {},
    deleteSelection: () => {},
    catchPass: undefined,
    endCatch: () => {},
    releasePass: undefined,
    endRelease: () => {},
    collectBall: undefined,
    endCollect: () => {},
    ...overrides,
  } as unknown as EditorWorkspace;
}

describe('SelectionPanel tool help and descriptions (#200)', () => {
  it('defines a name and description for every tool', () => {
    const requiredTools = [
      'select',
      'run',
      'pass',
      'kick',
      'attacker',
      'defender',
      'ball',
      'cone',
      'tackle-shield',
      'tackle-bag',
      'coach',
      'undo',
      'redo',
    ];

    for (const tool of requiredTools) {
      const help = getToolHelp(tool);
      expect(help.name).toBeTruthy();
      expect(help.description).toBeTruthy();
      expect(typeof help.name).toBe('string');
      expect(typeof help.description).toBe('string');
    }
  });

  it('shows the selected tool name and description for Attacker', () => {
    const ws = mockWorkspace({ tool: 'attacker' as EditorTool });
    render(<SelectionPanel workspace={ws} />);

    expect(screen.getByText('Attacker:')).toBeTruthy();
    expect(screen.getByText(/tap the pitch to place a player\./)).toBeTruthy();
  });

  it('shows the selected tool name and description for Defender', () => {
    const ws = mockWorkspace({ tool: 'defender' as EditorTool });
    render(<SelectionPanel workspace={ws} />);

    expect(screen.getByText('Defender:')).toBeTruthy();
    expect(screen.getByText(/tap the pitch to place a defending player\./)).toBeTruthy();
  });

  it('shows Kick when passKind is kick', () => {
    const ws = mockWorkspace({ tool: 'pass' as EditorTool, passKind: 'kick' });
    render(<SelectionPanel workspace={ws} />);

    expect(screen.getByText('Kick:')).toBeTruthy();
    expect(screen.getByText(/tap the player to kick to, or the pitch to kick to space\./)).toBeTruthy();
  });

  it('previews another tool when preview prop is set', () => {
    const ws = mockWorkspace({ tool: 'select' as EditorTool });
    render(<SelectionPanel workspace={ws} preview="undo" />);

    expect(screen.getByText('Undo:')).toBeTruthy();
    expect(screen.getByText(/reverse the last edit\./)).toBeTruthy();
  });

  it('appends progression step note when shownStep > 0', () => {
    const ws = mockWorkspace({ tool: 'attacker' as EditorTool, shownStep: 2 });
    render(<SelectionPanel workspace={ws} />);

    expect(screen.getByText(/Edits here change Step 2 and the Steps after it\./)).toBeTruthy();
  });
});
