import React from 'react';
import { Layer, Line } from 'react-konva';
import { DESIGN_TOKENS } from '../../constants/design-tokens';

/**
 * Props for the GridOverlay component
 */
export interface GridOverlayProps {
    /** Canvas width in pixels */
    width: number;
    /** Canvas height in pixels */
    height: number;
    /** Grid line spacing in pixels (default: 100) */
    gridSize?: number;
    /** Whether to show the grid */
    visible?: boolean;
}

/**
 * GridOverlay renders a toggleable grid overlay for positioning reference.
 * Grid lines are rendered at regular intervals (default 100 units) using
 * Tactical Clubhouse aesthetic with Tactics White at 30% opacity.
 * 
 * FR-CAN-04: System MUST provide a toggleable grid overlay
 */
export const GridOverlay: React.FC<GridOverlayProps> = ({
    width,
    height,
    gridSize = 100,
    visible = true
}) => {
    if (!visible) {
        return null;
    }

    const gridLines: React.ReactNode[] = [];

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
        gridLines.push(
            <Line
                key={`v-${x}`}
                points={[x, 0, x, height]}
                stroke={DESIGN_TOKENS.colours.background} // Tactics White
                strokeWidth={1}
                opacity={0.3}
                listening={false}
            />
        );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
        gridLines.push(
            <Line
                key={`h-${y}`}
                points={[0, y, width, y]}
                stroke={DESIGN_TOKENS.colours.background} // Tactics White
                strokeWidth={1}
                opacity={0.3}
                listening={false}
            />
        );
    }

    return (
        <Layer listening={false}>
            {gridLines}
        </Layer>
    );
};
