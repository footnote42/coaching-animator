// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validate, resolveStep } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';
import example from '@/features/practice/examples/passing-square-progressions.json';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';
import { PracticeShareViewer } from '@/features/practice/components/PracticeShareViewer';

vi.mock('@/features/practice/components/PracticeCanvas', () => ({
  default: ({ step }: { step: { index: number } }) => <div data-testid="canvas">canvas {step.index}</div>,
}));

const result = validate(example);
if (!result.ok) throw new Error('example script is invalid');
const script: PracticeScript = result.script;

afterEach(cleanup);

describe('PracticeThumbnail', () => {
  it('draws the Area and every marker of the Step as SVG', () => {
    const step = resolveStep(script, 0);
    const html = renderToStaticMarkup(<PracticeThumbnail step={step} title="Base Step" />);
    expect(html).toContain(`viewBox="0 0 ${step.area.width} ${step.area.length}"`);
    expect(html).toContain('aria-label="Base Step"');
    const shapes = html.match(/<(circle|ellipse|polygon|rect) /g) ?? [];
    // one background rect plus one shape per marker
    expect(shapes.length).toBe(step.markers.length + 1);
    expect(html).toContain('<polyline');
  });

  it('can leave out move paths', () => {
    const html = renderToStaticMarkup(<PracticeThumbnail step={resolveStep(script, 0)} showMoves={false} />);
    expect(html).not.toContain('<polyline');
    expect(html).toContain('aria-hidden="true"');
  });
});

describe('PracticeShareViewer', () => {
  it('opens on Step 0 and steps forward and back', async () => {
    render(<PracticeShareViewer title="Passing square" script={script} />);
    expect(screen.getByRole('heading', { name: 'Passing square' })).toBeTruthy();
    expect(screen.getByText('Base Step (1/3)')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Previous Step' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(screen.getByText('Step 1: Time lever (2/3)')).toBeTruthy();
    expect(await screen.findByTestId('canvas')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));
    expect(screen.getByText('Base Step (1/3)')).toBeTruthy();
  });

  it('toggles Commentary with one tap', () => {
    render(<PracticeShareViewer title="Passing square" script={script} />);
    const point = script.base.commentary.points[0];
    expect(screen.getByText(point)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hide Commentary' }));
    expect(screen.queryByText(point)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show Commentary' }));
    expect(screen.getByText(point)).toBeTruthy();
  });

  it('offers half, normal and double speed', () => {
    render(<PracticeShareViewer title="Passing square" script={script} />);
    const half = screen.getByRole('button', { name: 'Half speed' });
    expect(screen.getByRole('button', { name: 'Normal speed' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(half);
    expect(half.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Double speed' })).toBeTruthy();
  });

  it('play all restarts from Step 0', () => {
    render(<PracticeShareViewer title="Passing square" script={script} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    const playAll = screen.getByRole('button', { name: /Play all/ });
    fireEvent.click(playAll);
    expect(playAll.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Base Step (1/3)')).toBeTruthy();
  });
});
