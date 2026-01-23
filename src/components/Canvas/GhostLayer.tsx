import React from 'react';
import { Layer, Circle, Text, Ellipse } from 'react-konva';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { Entity } from '../../types';

const GHOST_OPACITY = 0.3;

/**
 * GhostLayer renders semi-transparent entities from the previous frame.
 * Helps coaches visualize movement patterns while authoring plays.
 * 
 * Behavior:
 * - Only renders when showGhosts is enabled in uiStore
 * - Only renders when currentFrameIndex > 0 (Frame 2+)
 * - Shows entities at 30% opacity
 * - Non-interactive (no drag, click, or selection)
 */
export const GhostLayer: React.FC = () => {
    const { project, currentFrameIndex } = useProjectStore();
    const { showGhosts } = useUIStore();

    // Exit early if ghosts are disabled
    if (!showGhosts) {
        return <Layer listening={false} />;
    }

    // Exit early if no project
    if (!project) {
        return <Layer listening={false} />;
    }

    // Exit early if on Frame 1 (no previous frame)
    if (currentFrameIndex === 0) {
        return <Layer listening={false} />;
    }

    // Get previous frame
    const previousFrameIndex = currentFrameIndex - 1;
    const previousFrame = project.frames[previousFrameIndex];

    if (!previousFrame) {
        return <Layer listening={false} />;
    }

    // Extract entities from previous frame
    const ghostEntities = Object.values(previousFrame.entities);

    return (
        <Layer listening={false}>
            {ghostEntities.map((entity) => (
                <React.Fragment key={`ghost-${entity.id}`}>
                    {renderGhostEntity(entity)}
                </React.Fragment>
            ))}
        </Layer>
    );
};

/**
 * Render a single ghost entity based on its type.
 */
function renderGhostEntity(entity: Entity) {
    const { type, x, y, color, label } = entity;

    if (type === 'ball') {
        return (
            <>
                {/* Oval ball shape */}
                <Ellipse
                    x={x}
                    y={y}
                    radiusX={18}
                    radiusY={12}
                    fill={color}
                    opacity={GHOST_OPACITY}
                />
            </>
        );
    }

    // Player, cone, or marker
    return (
        <>
            {/* Entity circle */}
            <Circle
                x={x}
                y={y}
                radius={20}
                fill={color}
                stroke="#000"
                strokeWidth={1}
                opacity={GHOST_OPACITY}
            />

            {/* Entity label */}
            <Text
                x={x - 15}
                y={y - 8}
                width={30}
                text={label}
                fontSize={14}
                fontFamily="monospace"
                fontStyle="bold"
                fill="#fff"
                align="center"
                opacity={GHOST_OPACITY}
            />
        </>
    );
}
