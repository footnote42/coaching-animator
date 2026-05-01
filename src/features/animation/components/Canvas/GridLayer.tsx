import React from 'react';
import { Layer, Line, Circle } from 'react-konva';
import { GRID_COLS, GRID_ROWS } from '../../services/snapGrid';

/**
 * Props for the GridLayer component
 */
export interface GridLayerProps {
    /** Stage width */
    width: number;
    /** Stage height */
    height: number;
    /** Whether grid is visible */
    visible: boolean;
}

/**
 * Renders a subtle grid overlay for snap-to-grid.
 * Consists of vertical and horizontal lines based on GRID_COLS and GRID_ROWS.
 */
export const GridLayer: React.FC<GridLayerProps> = ({ width, height, visible }) => {
    // Optimization: Don't even render the Layer if not visible
    if (!visible) return null;

    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;

    const verticalLines = [];
    for (let i = 1; i < GRID_COLS; i++) {
        const x = i * cellW;
        verticalLines.push(
            <Line
                key={`v-${i}`}
                points={[x, 0, x, height]}
                stroke="white"
                strokeWidth={1}
                opacity={0.1}
                listening={false}
            />
        );
    }

    const horizontalLines = [];
    for (let i = 1; i < GRID_ROWS; i++) {
        const y = i * cellH;
        horizontalLines.push(
            <Line
                key={`h-${i}`}
                points={[0, y, width, y]}
                stroke="white"
                strokeWidth={1}
                opacity={0.1}
                listening={false}
            />
        );
    }

    const dots = [];
    for (let i = 1; i < GRID_COLS; i++) {
        for (let j = 1; j < GRID_ROWS; j++) {
            dots.push(
                <Circle
                    key={`dot-${i}-${j}`}
                    x={i * cellW}
                    y={j * cellH}
                    radius={2}
                    fill="white"
                    opacity={0.5}
                    listening={false}
                />
            );
        }
    }

    return (
        <Layer listening={false}>
            {verticalLines}
            {horizontalLines}
            {dots}
        </Layer>
    );
};
