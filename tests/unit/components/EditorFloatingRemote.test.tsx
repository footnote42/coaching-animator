// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { EditorFloatingRemote } from '@/features/animation/components/Canvas/EditorFloatingRemote';

// Mock useProjectStore
const { mockGetState } = vi.hoisted(() => ({
  mockGetState: vi.fn(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    setCurrentFrame: vi.fn(),
    addFrame: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    toggleLoop: vi.fn(),
  }))
}));

vi.mock('@/core/stores/projectStore', () => ({
  useProjectStore: Object.assign(
    vi.fn((selector: (state: Record<string, unknown>) => unknown) => selector({
      currentFrameIndex: 0,
      isPlaying: false,
      project: { frames: [{ id: '1' }, { id: '2' }] },
      playbackSpeed: 1,
      loopPlayback: false,
    })),
    {
      getState: mockGetState
    }
  )
}));

// Mock useUIStore
vi.mock('@/core/stores/uiStore', () => ({
  useUIStore: Object.assign(
    vi.fn((selector: (state: Record<string, unknown>) => unknown) => selector({
      showGhosts: false,
    })),
    {
      getState: vi.fn(() => ({
        toggleGhosts: vi.fn(),
      }))
    }
  )
}));

describe('EditorFloatingRemote Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders playback controls', () => {
    render(<EditorFloatingRemote />);
    expect(screen.getByLabelText('Play')).toBeTruthy();
    expect(screen.getByLabelText('Previous frame')).toBeTruthy();
    expect(screen.getByLabelText('Next frame')).toBeTruthy();
    expect(screen.getByText('1/2')).toBeTruthy();
  });

  it('calls play when play button is clicked', () => {
    const playMock = vi.fn();
    mockGetState.mockReturnValue({
      play: playMock,
      pause: vi.fn(),
      setCurrentFrame: vi.fn(),
      addFrame: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      toggleLoop: vi.fn(),
    });

    render(<EditorFloatingRemote />);
    fireEvent.click(screen.getByLabelText('Play'));
    expect(playMock).toHaveBeenCalled();
  });

  it('toggles expanded state and shows second row', () => {
    render(<EditorFloatingRemote />);
    
    const expandBtn = screen.getByLabelText('Expand remote');
    fireEvent.click(expandBtn);
    
    expect(screen.getByLabelText('Collapse remote')).toBeTruthy();
    expect(screen.getByLabelText('Add frame')).toBeTruthy();
    expect(screen.getByLabelText('Enable loop')).toBeTruthy();
    expect(screen.getByLabelText('Enable ghost mode')).toBeTruthy();
  });

  it('calls addFrame when Add frame button is clicked', () => {
    const addFrameMock = vi.fn();
    mockGetState.mockReturnValue({
      play: vi.fn(),
      pause: vi.fn(),
      setCurrentFrame: vi.fn(),
      addFrame: addFrameMock,
      setPlaybackSpeed: vi.fn(),
      toggleLoop: vi.fn(),
    });

    render(<EditorFloatingRemote />);
    fireEvent.click(screen.getByLabelText('Expand remote'));
    fireEvent.click(screen.getByLabelText('Add frame'));
    expect(addFrameMock).toHaveBeenCalled();
  });

  it('calls setPlaybackSpeed when speed button is clicked', () => {
    const setSpeedMock = vi.fn();
    mockGetState.mockReturnValue({
      play: vi.fn(),
      pause: vi.fn(),
      setCurrentFrame: vi.fn(),
      addFrame: vi.fn(),
      setPlaybackSpeed: setSpeedMock,
      toggleLoop: vi.fn(),
    });

    render(<EditorFloatingRemote />);
    fireEvent.click(screen.getByLabelText('Expand remote'));
    fireEvent.click(screen.getByText('2x'));
    expect(setSpeedMock).toHaveBeenCalledWith(2);
  });
});
