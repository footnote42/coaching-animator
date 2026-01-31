import React from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';
import { PitchLayout, SportType } from '../../types';

export interface FieldLayoutOverlayProps {
    layout: PitchLayout;
    sport?: SportType; // Reserved for future sport-specific overlays
    width: number;
    height: number;
}

/**
 * Renders layout-specific overlays on top of the standard field.
 * Attack: Offensive zones, try line markers, attacking channels
 * Defence: Defensive zones, tackle lines, defensive positions
 * Training: Grid sections, drill zones, training areas
 */
export const FieldLayoutOverlay: React.FC<FieldLayoutOverlayProps> = ({
    layout,
    width,
    height,
}) => {
    if (layout === 'standard') {
        return null; // No overlay for standard layout
    }

    const overlayColor = 'rgba(255, 165, 0, 0.3)'; // Warm orange, semi-transparent
    const lineColor = 'rgba(255, 165, 0, 0.6)';
    const textColor = '#FF6B00';

    // Attack layout: Show offensive zones
    if (layout === 'attack') {
        return (
            <Layer listening={false}>
                {/* Attacking third zone */}
                <Rect
                    x={width * 0.66}
                    y={0}
                    width={width * 0.34}
                    height={height}
                    fill={overlayColor}
                    listening={false}
                />
                <Line
                    points={[width * 0.66, 0, width * 0.66, height]}
                    stroke={lineColor}
                    strokeWidth={2}
                    dash={[10, 5]}
                    listening={false}
                />
                <Text
                    text="ATTACK ZONE"
                    x={width * 0.75}
                    y={height / 2 - 10}
                    fontSize={14}
                    fontStyle="bold"
                    fill={textColor}
                    align="center"
                    offsetX={50}
                    listening={false}
                />
                {/* Attacking channels */}
                <Line
                    points={[width * 0.66, height / 3, width, height / 3]}
                    stroke={lineColor}
                    strokeWidth={1}
                    dash={[5, 5]}
                    listening={false}
                />
                <Line
                    points={[width * 0.66, (height * 2) / 3, width, (height * 2) / 3]}
                    stroke={lineColor}
                    strokeWidth={1}
                    dash={[5, 5]}
                    listening={false}
                />
            </Layer>
        );
    }

    // Defence layout: Show defensive zones
    if (layout === 'defence') {
        return (
            <Layer listening={false}>
                {/* Defensive third zone */}
                <Rect
                    x={0}
                    y={0}
                    width={width * 0.34}
                    height={height}
                    fill={overlayColor}
                    listening={false}
                />
                <Line
                    points={[width * 0.33, 0, width * 0.33, height]}
                    stroke={lineColor}
                    strokeWidth={2}
                    dash={[10, 5]}
                    listening={false}
                />
                <Text
                    text="DEFENCE ZONE"
                    x={width * 0.17}
                    y={height / 2 - 10}
                    fontSize={14}
                    fontStyle="bold"
                    fill={textColor}
                    align="center"
                    offsetX={60}
                    listening={false}
                />
                {/* Defensive lines */}
                <Line
                    points={[0, height / 3, width * 0.33, height / 3]}
                    stroke={lineColor}
                    strokeWidth={1}
                    dash={[5, 5]}
                    listening={false}
                />
                <Line
                    points={[0, (height * 2) / 3, width * 0.33, (height * 2) / 3]}
                    stroke={lineColor}
                    strokeWidth={1}
                    dash={[5, 5]}
                    listening={false}
                />
            </Layer>
        );
    }

    // Training layout: Show grid sections
    if (layout === 'training') {
        return (
            <Layer listening={false}>
                {/* Vertical dividers */}
                <Line
                    points={[width / 3, 0, width / 3, height]}
                    stroke={lineColor}
                    strokeWidth={2}
                    dash={[10, 5]}
                    listening={false}
                />
                <Line
                    points={[(width * 2) / 3, 0, (width * 2) / 3, height]}
                    stroke={lineColor}
                    strokeWidth={2}
                    dash={[10, 5]}
                    listening={false}
                />
                {/* Horizontal dividers */}
                <Line
                    points={[0, height / 2, width, height / 2]}
                    stroke={lineColor}
                    strokeWidth={2}
                    dash={[10, 5]}
                    listening={false}
                />
                {/* Zone labels */}
                <Text
                    text="ZONE 1"
                    x={width / 6}
                    y={height / 4}
                    fontSize={12}
                    fill={textColor}
                    align="center"
                    offsetX={25}
                    listening={false}
                />
                <Text
                    text="ZONE 2"
                    x={width / 2}
                    y={height / 4}
                    fontSize={12}
                    fill={textColor}
                    align="center"
                    offsetX={25}
                    listening={false}
                />
                <Text
                    text="ZONE 3"
                    x={(width * 5) / 6}
                    y={height / 4}
                    fontSize={12}
                    fill={textColor}
                    align="center"
                    offsetX={25}
                    listening={false}
                />
            </Layer>
        );
    }

    return null;
};
