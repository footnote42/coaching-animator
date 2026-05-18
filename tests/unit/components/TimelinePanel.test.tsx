// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimelinePanel } from '@/features/animation/components/TimelinePanel';

const mockPlay = vi.fn();
const mockPause = vi.fn();
const mockReset = vi.fn();
const mockSetCurrentFrame = vi.fn();
const mockAddFrame = vi.fn();
const mockRemoveFrame = vi.fn();
const mockDuplicateFrame = vi.fn();
const mockSetPlaybackSpeed = vi.fn();
const mockToggleLoop = vi.fn();
const mockUpdateFrame = vi.fn();

// Mock the stores
vi.mock('@/core/stores/projectStore', () => ({
  useProjectStore: Object.assign(
    vi.fn((selector) => selector({
      project: {
        id: 'test-id',
        name: 'Test Project',
        frames: [{ id: 'f1', index: 0, entities: {}, annotations: [] }]
      },
      currentFrameIndex: 0,
      isPlaying: false,
      playbackSpeed: 1,
      loopPlayback: false
    })),
    {
      getState: () => ({
        play: mockPlay,
        pause: mockPause,
        reset: mockReset,
        setCurrentFrame: mockSetCurrentFrame,
        addFrame: mockAddFrame,
        removeFrame: mockRemoveFrame,
        duplicateFrame: mockDuplicateFrame,
        setPlaybackSpeed: mockSetPlaybackSpeed,
        toggleLoop: mockToggleLoop,
        updateFrame: mockUpdateFrame
      })
    }
  )
}));

vi.mock('@/core/stores/uiStore', () => ({
  useUIStore: Object.assign(
    vi.fn((selector) => selector({
      showGhosts: false
    })),
    {
      getState: () => ({
        toggleGhosts: vi.fn()
      })
    }
  )
}));

vi.mock('@/lib/contexts/UserContext', () => ({
  useUser: () => ({ isAuthenticated: true })
}));

vi.mock('@/core/constants/validation', () => ({
  VALIDATION: { PROJECT: { GUEST_MAX_FRAMES: 10, MAX_FRAMES: 50 } }
}));

// Mock child components to isolate TimelinePanel
vi.mock('@/features/animation/components/Timeline/FrameStrip', () => ({
  FrameStrip: () => <div data-testid="frame-strip-mock">FrameStrip</div>
}));

vi.mock('@/features/animation/components/ShareSheet', () => ({
  ShareSheet: () => <div data-testid="share-sheet-mock">ShareSheet</div>
}));

describe('TimelinePanel', () => {
  it('renders correctly', () => {
    render(<TimelinePanel />);
    expect(screen.getByText('Timeline')).toBeDefined();
    expect(screen.getByTestId('frame-strip-mock')).toBeDefined();
  });

  it('calls play when play button is clicked', () => {
    render(<TimelinePanel />);
    
    fireEvent.click(screen.getAllByLabelText(/play animation/i)[0]);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('calls addFrame when add button is clicked', () => {
    render(<TimelinePanel />);
    
    // There are two "Add Frame" triggers
    fireEvent.click(screen.getAllByLabelText('Add Frame')[0]);
    expect(mockAddFrame).toHaveBeenCalled();
  });
});
