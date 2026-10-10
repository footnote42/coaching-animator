// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { EditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { SelectionPanel } from './SelectionPanel';

const workspace = {
  editing: true,
  playing: false,
  selectedMarker: undefined,
  selectedMove: undefined,
  selection: { marker: null, waypoint: null },
  balls: [],
  passes: [],
  tool: 'select',
  passKind: 'pass',
} as unknown as EditorWorkspace;

// The component relies on Next's automatic JSX runtime; Vitest here uses the classic one.
(globalThis as { React?: typeof React }).React = React;

const HINT = 'Drag a marker to move it.';

describe('SelectionPanel on a phone', () => {
  afterEach(cleanup);

  it('starts compact: one line, hint truncated, toggle collapsed', () => {
    render(<SelectionPanel workspace={workspace} hint={HINT} />);
    const region = screen.getByRole('region', { name: 'Selection' });
    expect(region.className).toContain('h-14');
    expect(region.className).not.toContain('h-44');
    expect(screen.getByText(HINT).className).toContain('truncate');
    expect(screen.getByRole('button', { name: 'Show more' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('expands to the full panel and collapses again', () => {
    render(<SelectionPanel workspace={workspace} hint={HINT} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
    const region = screen.getByRole('region', { name: 'Selection' });
    expect(region.className).toContain('h-44');
    expect(screen.getByText(HINT).className).not.toContain('truncate');
    const toggle = screen.getByRole('button', { name: 'Show less' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(region.className).toContain('h-14');
  });

  it('collapsed, the body scrolls sideways only so a vertical swipe reaches the page', () => {
    render(<SelectionPanel workspace={workspace} hint={HINT} />);
    const body = screen.getByText(HINT).parentElement!;
    expect(body.className).toContain('overflow-x-auto');
    expect(body.className).toContain('overflow-y-hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(body.className).toContain('overflow-y-auto');
  });
});
