// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

// Mock react-konva — it requires canvas/DOM APIs not available in test environment
vi.mock('react-konva', () => ({
  Stage: ({ children }: { children: React.ReactNode }) => children,
  Layer: ({ children }: { children: React.ReactNode }) => children,
  Group: ({ children }: { children: React.ReactNode }) => children,
  Circle: () => null,
  Ellipse: () => null,
  Rect: () => null,
  Text: () => null,
  Arrow: () => null,
  Line: () => null,
  Image: () => null,
}));

// Mock konva
vi.mock('konva', () => ({
  default: {},
}));

import React from 'react';
import { render } from '@testing-library/react';
import { ReplayViewer } from '../ReplayViewer';

const VALID_PAYLOAD = {
  version: '1.0.0',
  name: 'Test Animation',
  sport: 'rugby-union',
  frames: [
    {
      id: 'frame-1',
      index: 0,
      duration: 1000,
      entities: {
        e1: {
          id: 'e1',
          type: 'player',
          x: 100,
          y: 200,
          color: '#2563EB',
          label: '10',
          team: 'attack',
        },
        e2: {
          id: 'e2',
          type: 'ball',
          x: 300,
          y: 300,
          color: '#FFFFFF',
          label: '',
          team: 'neutral',
        },
      },
      annotations: [
        {
          id: 'a1',
          type: 'arrow',
          points: [100, 200, 300, 300],
          color: '#E6EA0C',
          startFrameId: 'frame-1',
          endFrameId: 'frame-1',
        },
      ],
    },
  ],
  settings: {},
};

const DEGRADED_PAYLOAD = {
  version: '0.1',
  name: 'Old Animation',
  sport: 'quidditch', // unrecognised — should fallback to rugby-union
  frames: [
    {
      id: 'f1',
      index: 0,
      duration: 500,
      entities: {
        e1: {
          id: 'e1',
          type: 'player',
          x: NaN,
          y: Infinity,
          color: '',
          label: '',
          team: 'attack',
        },
        e2: {
          id: 'e2',
          type: 'tackle-shield',
          x: 50,
          y: 50,
          color: '#000',
          label: '',
          team: 'neutral',
        },
      },
      annotations: [
        {
          id: 'a1',
          type: 'line',
          points: [0, 0, 100, 100],
          color: '#FFF',
          // missing startFrameId/endFrameId
        },
      ],
    },
  ],
  settings: {},
};

describe('ReplayViewer', () => {
  it('renders with a valid payload without crashing', () => {
    expect(() => render(<ReplayViewer payload={VALID_PAYLOAD} />)).not.toThrow();
  });

  it('renders with a degraded payload without crashing', () => {
    expect(() => render(<ReplayViewer payload={DEGRADED_PAYLOAD} />)).not.toThrow();
  });

  it('renders empty state for payload with no frames', () => {
    const { getByText } = render(
      <ReplayViewer payload={{ frames: [] }} />,
    );
    expect(getByText('No frames to display')).toBeDefined();
  });
});
