// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { GridLayer } from '@/features/animation/components/Canvas/GridLayer';
import { GRID_COLS, GRID_ROWS } from '@/features/animation/services/snapGrid';

// Mock react-konva
vi.mock('react-konva', () => {
    return {
        Layer: ({ children, visible, listening }: { children: React.ReactNode; visible?: boolean; listening?: boolean }) => (
            visible !== false ? <div data-testid="konva-layer" data-listening={listening}>{children}</div> : null
        ),
        Line: (props: Record<string, unknown>) => <div data-testid="konva-line" {...props} />,
        Circle: (props: Record<string, unknown>) => <div data-testid="konva-circle" {...props} />,
    };
});

describe('GridLayer Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders nothing when visible is false', () => {
        render(<GridLayer width={1600} height={1200} visible={false} />);
        expect(screen.queryByTestId('konva-layer')).toBeNull();
    });

    it('renders correct number of lines and dots when visible is true', () => {
        render(<GridLayer width={1600} height={1200} visible={true} />);
        expect(screen.getByTestId('konva-layer')).toBeTruthy();
        
        const lines = screen.getAllByTestId('konva-line');
        // (GRID_COLS - 1) vertical lines + (GRID_ROWS - 1) horizontal lines
        const expectedLines = (GRID_COLS - 1) + (GRID_ROWS - 1);
        expect(lines.length).toBe(expectedLines);

        const circles = screen.getAllByTestId('konva-circle');
        const expectedCircles = (GRID_COLS - 1) * (GRID_ROWS - 1);
        expect(circles.length).toBe(expectedCircles);
    });

    it('sets listening to false', () => {
        render(<GridLayer width={1600} height={1200} visible={true} />);
        const layer = screen.getByTestId('konva-layer');
        expect(layer.getAttribute('data-listening')).toBe('false');
    });
});
