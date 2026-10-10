// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { validate, resolveStep } from '@/features/practice/engine';
import { addProgression, setLever } from '@/features/practice/editing';
import type { PracticeScript } from '@/features/practice/schema';
import withProgressions from '@/features/practice/examples/passing-square-progressions.json';
import { AddProgressionButton } from '@/features/practice/components/StepControls';

afterEach(cleanup);

function load(input: unknown): PracticeScript {
  const result = validate(input);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.script;
}

describe('optional Progression lever', () => {
  it('keeps the lever on old scripts unchanged', () => {
    const script = load(withProgressions);
    expect(script.progressions.length).toBeGreaterThan(0);
    for (const p of script.progressions) expect(p.lever).toBeTruthy();
    expect(resolveStep(script, 1).lever).toBe(script.progressions[0].lever);
  });

  it('accepts a Progression with no lever', () => {
    const base = load(withProgressions);
    const noLever = JSON.parse(JSON.stringify(base)) as PracticeScript;
    delete noLever.progressions[0].lever;
    const script = load(noLever);
    expect(script.progressions[0].lever).toBeUndefined();
    expect(resolveStep(script, 1).lever).toBeUndefined();
    expect(script.progressions[1].lever).toBe(base.progressions[1].lever);
  });

  it('still rejects an unknown lever', () => {
    const base = load(withProgressions);
    const bad = { ...base, progressions: [{ lever: 'speed', commentary: { points: [] }, changes: [] }] };
    expect(validate(bad).ok).toBe(false);
  });

  it('adds and clears a lever through the editing helpers', () => {
    const base = load(withProgressions);
    const added = addProgression(base, undefined);
    const n = added.progressions.length;
    expect('lever' in added.progressions[n - 1]).toBe(false);
    const set = setLever(added, n, 'time');
    expect(typeof set).not.toBe('string');
    const cleared = setLever(set as PracticeScript, n, undefined);
    expect((cleared as PracticeScript).progressions[n - 1].lever).toBeUndefined();
  });
});

describe('Add Progression dialog', () => {
  it('adds a Progression without choosing a lever', () => {
    const script = load(withProgressions);
    const onAdd = vi.fn();
    render(<AddProgressionButton script={script} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /Add Progression/ }));
    expect(screen.getByText(/or leave blank/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    const next = onAdd.mock.calls[0][0] as PracticeScript;
    expect(next.progressions.length).toBe(script.progressions.length + 1);
    expect(next.progressions[next.progressions.length - 1].lever).toBeUndefined();
  });

  it('adds a Progression with a chosen lever', () => {
    const script = load(withProgressions);
    const onAdd = vi.fn();
    render(<AddProgressionButton script={script} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /Add Progression/ }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'space' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    const next = onAdd.mock.calls[0][0] as PracticeScript;
    expect(next.progressions[next.progressions.length - 1].lever).toBe('space');
  });
});
