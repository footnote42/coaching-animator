// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { toast } from 'sonner';
import { validate, resolveStep } from '@/features/practice/engine';
import type { PracticeScript } from '@/features/practice/schema';
import example from '@/features/practice/examples/passing-square-progressions.json';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';
import { PracticeShareViewer } from '@/features/practice/components/PracticeShareViewer';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('konva', () => ({
  default: {},
}));

vi.mock('react-konva', () => ({
  Stage: ({ children }: { children?: React.ReactNode }) => <div data-testid="mock-stage">{children}</div>,
  Layer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Rect: () => null,
  Line: () => null,
  Arrow: () => null,
  Circle: () => null,
  Ellipse: () => null,
  RegularPolygon: () => null,
  Text: () => null,
  Group: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

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
  beforeEach(() => {
    window.sessionStorage.clear();
  });

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

  it('links the brand mark to the home page', () => {
    render(<PracticeShareViewer title="Passing square" script={script} />);
    const brandLink = screen.getByRole('link', { name: 'Coaching Animator home' });
    expect(brandLink).toBeTruthy();
    expect(brandLink.getAttribute('href')).toBe('/');
  });

  it('labels the flag button as Report with tooltip and accessible name', () => {
    render(<PracticeShareViewer practiceId="p123" title="Passing square" script={script} />);
    const reportBtn = screen.getByRole('button', { name: 'Report' });
    expect(reportBtn).toBeTruthy();
    expect(reportBtn.getAttribute('title')).toBe('Report');
    expect(screen.getByText('Report')).toBeTruthy();
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

  it('toggles Commentary with single playback bar button (aria-pressed), persisting across visit', () => {
    window.sessionStorage.clear();
    render(<PracticeShareViewer title="Passing square" script={script} />);
    const point = script.base.commentary.points[0];
    expect(screen.getByText(point)).toBeTruthy();

    // No close X button on the overlay
    expect(screen.queryByRole('button', { name: 'Close Commentary' })).toBeNull();

    // Dismiss with single playback bar toggle
    const toggleBtn = screen.getByRole('button', { name: 'Hide Commentary' });
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggleBtn);

    expect(screen.queryByText(point)).toBeNull();
    expect(window.sessionStorage.getItem('ca_share_show_commentary')).toBe('false');

    // Advancing step keeps commentary hidden
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(screen.queryByText(point)).toBeNull();

    // Restore with nav button
    const restoreBtn = screen.getByRole('button', { name: 'Show Commentary' });
    expect(restoreBtn.getAttribute('aria-pressed')).toBe('false');
    expect(restoreBtn.getAttribute('title')).toBe('Show Commentary');
    fireEvent.click(restoreBtn);

    expect(window.sessionStorage.getItem('ca_share_show_commentary')).toBe('true');
  });

  it('starts with Commentary collapsed on phones when no saved state exists', () => {
    window.sessionStorage.clear();
    const origMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    try {
      render(<PracticeShareViewer title="Passing square" script={script} />);
      const point = script.base.commentary.points[0];
      expect(screen.queryByText(point)).toBeNull();
      const showBtn = screen.getByRole('button', { name: 'Show Commentary' });
      expect(showBtn.getAttribute('aria-pressed')).toBe('false');
    } finally {
      window.matchMedia = origMatchMedia;
    }
  });

  it('uses navigator.share when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      writable: true,
      configurable: true,
    });

    render(<PracticeShareViewer title="Passing square" script={script} />);
    const shareBtn = screen.getByRole('button', { name: 'Share' });
    expect(shareBtn.getAttribute('title')).toBe('Share');
    fireEvent.click(shareBtn);

    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Passing square',
      }),
    );
  });

  it('copies link and confirms when navigator.share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<PracticeShareViewer title="Passing square" script={script} />);
    const shareBtn = screen.getByRole('button', { name: 'Share' });
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Link copied.');
    });
  });

  it('hides fullscreen button when Fullscreen API is unavailable and shows when available', () => {
    // By default in jsdom document.fullscreenEnabled is falsy
    const { unmount } = render(<PracticeShareViewer title="Passing square" script={script} />);
    expect(screen.queryByRole('button', { name: 'Full screen' })).toBeNull();
    unmount();

    // Enable fullscreen API
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      writable: true,
      configurable: true,
    });

    render(<PracticeShareViewer title="Passing square" script={script} />);
    const fsBtn = screen.getByRole('button', { name: 'Full screen' });
    expect(fsBtn).toBeTruthy();
    expect(fsBtn.getAttribute('title')).toBe('Full screen');
  });

  it('moves Copy script into overflow menu with explanation and copies script', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<PracticeShareViewer title="Passing square" script={script} />);

    // Initially Copy script is not in the header
    expect(screen.queryByRole('menuitem', { name: /Copy script/ })).toBeNull();

    // Click More options button
    const moreBtn = screen.getByRole('button', { name: 'More options' });
    expect(moreBtn.getAttribute('title')).toBe('More options');
    fireEvent.click(moreBtn);

    // Overflow menu opens
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getByText('Copy the Practice Script to adapt or hand to an AI.')).toBeTruthy();

    const copyItem = screen.getByRole('menuitem', { name: /Copy script/ });
    fireEvent.click(copyItem);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(JSON.stringify(script, null, 2));
      expect(toast.success).toHaveBeenCalledWith('Script copied.');
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('offers half, normal and double speed', () => {
    render(<PracticeShareViewer title="Passing square" script={script} />);
    const half = screen.getByRole('button', { name: '½× speed' });
    expect(screen.getByRole('button', { name: '1× speed' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(half);
    expect(half.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '2× speed' })).toBeTruthy();
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

