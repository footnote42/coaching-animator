// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { validate, resolveStep } from '@/features/practice/engine';
import passingSquare from '@/features/practice/examples/passing-square.json';
import { GalleryCardPreview } from './GalleryCardPreview';

const result = validate(passingSquare);
if (!result.ok) throw new Error('fixture invalid');
const step = resolveStep(result.script, 0);

function mockMotionPreference(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setup(playing = false) {
  const onPlayingChange = vi.fn();
  const onOpen = vi.fn();
  render(
    <GalleryCardPreview step={step} title="Square" playing={playing} onPlayingChange={onPlayingChange} onOpen={onOpen} />,
  );
  return { button: screen.getByRole('button'), onPlayingChange, onOpen };
}

describe('GalleryCardPreview', () => {
  beforeEach(() => {
    mockMotionPreference(false);
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('plays while a mouse hovers and stops when it leaves', () => {
    const { button, onPlayingChange } = setup();
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    expect(onPlayingChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles on tap, and does not open the Practice', () => {
    const { button, onPlayingChange, onOpen } = setup(false);
    fireEvent.pointerDown(button, { pointerType: 'touch' });
    fireEvent.click(button);
    expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('stops on a second tap', () => {
    const { button, onPlayingChange } = setup(true);
    fireEvent.pointerDown(button, { pointerType: 'touch' });
    fireEvent.click(button);
    expect(onPlayingChange).toHaveBeenLastCalledWith(false);
  });

  it('opens the Practice on a mouse click', () => {
    const { button, onPlayingChange, onOpen } = setup();
    fireEvent.pointerDown(button, { pointerType: 'mouse' });
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onPlayingChange).not.toHaveBeenCalled();
  });

  it('runs no animation frames when the viewer prefers reduced motion', () => {
    mockMotionPreference(true);
    setup(true);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('runs animation frames while playing', () => {
    setup(true);
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('runs no animation frames while stopped', () => {
    setup(false);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
