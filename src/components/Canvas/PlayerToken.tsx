import React, { useRef } from 'react';
import { Group, Circle, Ellipse, Text } from 'react-konva';
import { Entity } from '../../types';
import { DESIGN_TOKENS } from '../../constants/design-tokens';

/**
 * Props for the PlayerToken component
 */
export interface PlayerTokenProps {
    /** Entity data */
    entity: Entity;
    /** Whether this entity is selected */
    isSelected: boolean;
    /** Whether token is draggable */
    draggable: boolean;
    /** Called on selection */
    onSelect: () => void;
    /** Called on drag end */
    onDragEnd: (x: number, y: number) => void;
    /** Called on double-click */
    onDoubleClick: () => void;
    /** Called on right-click */
    onContextMenu: (event: { x: number; y: number }) => void;
    /** Opacity for fade-in/fade-out (0-1, default 1) */
    opacity?: number;
}

/**
 * Individual player token on the canvas.
 * Renders entities (players, ball, markers, cones) with drag support and selection highlighting.
 *
 * Visual specifications:
 * - Player: 20px radius circle with team color and jersey number label
 * - Ball: 12px radius circle with brown color (#854D0E)
 * - Cone: 15px radius circle with orange color
 * - Marker: 10px radius circle with pitch-green color
 * - Selection: 3px stroke outline in pitch-green
 */
export const PlayerToken: React.FC<PlayerTokenProps> = ({
    entity,
    isSelected,
    draggable,
    onSelect,
    onDragEnd,
    onDoubleClick,
    onContextMenu,
    opacity = 1.0
}) => {
    const groupRef = useRef<any>(null);
    const lastClickTimeRef = useRef<number>(0);
    const lastClickPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Determine size based on entity type
    const getRadius = (type: Entity['type']): number => {
        switch (type) {
            case 'player':
                return 20;
            case 'ball':
                return 12;
            case 'cone':
                return 15;
            case 'marker':
                return 10;
            default:
                return 20;
        }
    };

    // Determine color based on entity type and color property
    const getColor = (): string => {
        // Use entity's color if specified
        if (entity.color) {
            return entity.color;
        }

        // Fallback to type-based defaults
        switch (entity.type) {
            case 'ball':
                return '#854D0E'; // Brown
            case 'cone':
                return '#EA580C'; // Orange
            case 'marker':
                return DESIGN_TOKENS.colors.primary; // Pitch green
            case 'player':
                // Use team-based default colors
                const teamColors = {
                    attack: DESIGN_TOKENS.colors.attack[0],
                    defense: DESIGN_TOKENS.colors.defense[0],
                    neutral: DESIGN_TOKENS.colors.neutral[0]
                };
                return teamColors[entity.team] || DESIGN_TOKENS.colors.primary;
            default:
                return DESIGN_TOKENS.colors.primary;
        }
    };

    // Handle drag end with position clamping
    const handleDragEnd = (e: any) => {
        const node = e.target;
        const x = node.x();
        const y = node.y();

        // Clamp position to canvas bounds (0-2000 for both x and y)
        // Note: The exact max bounds should come from FIELD_DIMENSIONS[sport]
        // but for now we use a safe default of 2000x2000
        const clampedX = Math.max(0, Math.min(x, 2000));
        const clampedY = Math.max(0, Math.min(y, 2000));

        // Reset position to clamped values
        node.x(clampedX);
        node.y(clampedY);

        // Call the callback with clamped position
        onDragEnd(clampedX, clampedY);
    };

    // Handle click with custom double-click detection and drag threshold
    const handleClick = (e: any) => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTimeRef.current;

        // Get current mouse position
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();
        const currentX = pointerPosition.x;
        const currentY = pointerPosition.y;

        // Calculate distance moved since last click
        const deltaX = currentX - lastClickPositionRef.current.x;
        const deltaY = currentY - lastClickPositionRef.current.y;
        const distanceMoved = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Define threshold: 10 pixels - if mouse moved more than this, it's likely a drag not a double-click
        const movementThreshold = 10;

        if (timeSinceLastClick < 500 && distanceMoved < movementThreshold) {
            // Double-click detected (increased from 300ms to 500ms for better reliability)
            // Only trigger if mouse didn't move significantly (prevents triggering during drag)
            onDoubleClick();
            lastClickTimeRef.current = 0; // Reset to prevent triple-click
        } else {
            // Single click
            onSelect();
            lastClickTimeRef.current = now;
            lastClickPositionRef.current = { x: currentX, y: currentY };
        }
    };

    // Handle right-click context menu
    const handleContextMenu = (e: any) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();

        onContextMenu({
            x: pointerPosition.x,
            y: pointerPosition.y
        });
    };

    const radius = getRadius(entity.type);
    const color = getColor();
    const showLabel = entity.type === 'player' && entity.label;

    return (
        <Group
            ref={groupRef}
            id={entity.id}
            x={entity.x}
            y={entity.y}
            draggable={draggable}
            onClick={handleClick}
            onTap={handleClick}
            onDblClick={onDoubleClick}
            onDblTap={onDoubleClick}
            onContextMenu={handleContextMenu}
            onDragEnd={handleDragEnd}
        >
            {/* Render shape based on entity type */}
            {entity.type === 'ball' ? (
                /* Ball: Oval/ellipse shape approximating a rugby ball (~1.5:1 ratio) */
                <Ellipse
                    radiusX={18}
                    radiusY={12}
                    fill={color}
                    stroke={isSelected ? DESIGN_TOKENS.colors.primary : '#1A3D1A'}
                    strokeWidth={isSelected ? 3 : 1}
                    shadowEnabled={false}
                    opacity={opacity}
                />
            ) : (
                /* Players, cones, markers: Circle shape */
                <Circle
                    radius={radius}
                    fill={color}
                    stroke={isSelected ? DESIGN_TOKENS.colors.primary : undefined}
                    strokeWidth={isSelected ? 3 : 0}
                    shadowEnabled={false}
                    opacity={opacity}
                />
            )}

            {/* Label text (only for players with labels) */}
            {showLabel && (
                <Text
                    text={entity.label}
                    fontSize={14}
                    fontFamily={DESIGN_TOKENS.typography.fontBody}
                    fill={DESIGN_TOKENS.colors.textInverse}
                    align="center"
                    verticalAlign="middle"
                    width={radius * 2}
                    height={radius * 2}
                    offsetX={radius}
                    offsetY={radius}
                    listening={false} // Text shouldn't intercept events
                    opacity={opacity}
                />
            )}
        </Group>
    );
};
