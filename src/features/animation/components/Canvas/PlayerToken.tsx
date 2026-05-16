// Force reload: Entity palette fix
import React, { useRef } from 'react';
import { Group, Circle, Ellipse, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { Entity, EntityOrientation } from '@/core/types';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';

import { EntityColors } from '../../services/entityColors';
import { snapPosition } from '../../services/snapGrid';

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
    /** Whether snap-to-grid is enabled */
    snapEnabled?: boolean;
    /** Stage width for clamping/snapping */
    stageWidth?: number;
    /** Stage height for clamping/snapping */
    stageHeight?: number;
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
    opacity = 1.0,
    snapEnabled = false,
    stageWidth,
    stageHeight
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const lastClickTimeRef = useRef<number>(0);
    const lastClickPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Determine size based on entity type (reduced 20-30% from original sizes)
    const getRadius = (type: Entity['type']): number => {
        switch (type) {
            case 'player':
                return 15; // Was 20px, reduced ~25%
            case 'ball':
                return 9;  // Was 12px, reduced 25%
            case 'cone':
                return 8; // Reduced from 11 to 8 for minimalist look (LOW-001)
            case 'tackle-shield':
                return 20; // Larger for equipment
            case 'tackle-bag':
                return 16; // Medium size
            default:
                return 15;
        }
    };

    // Get rotation angle based on orientation
    const getRotationAngle = (orientation: EntityOrientation | undefined): number => {
        switch (orientation) {
            case 'up': return 0;
            case 'right': return 90;
            case 'down': return 180;
            case 'left': return 270;
            default: return 0;
        }
    };

    // Determine color based on entity type and color property
    const getColor = (): string => {
        return EntityColors.resolve(entity.color, entity.type, entity.team);
    };

    // Handle drag end with position clamping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (e: any) => {
        const node = e.target;
        const x = node.x();
        const y = node.y();

        // Clamp position to canvas bounds
        const maxW = stageWidth || 2000;
        const maxH = stageHeight || 2000;
        const clampedX = Math.max(0, Math.min(x, maxW));
        const clampedY = Math.max(0, Math.min(y, maxH));

        // Apply snap if enabled
        const { x: finalX, y: finalY } = snapPosition(
            clampedX,
            clampedY,
            maxW,
            maxH,
            snapEnabled
        );

        // Reset position to final values
        node.x(finalX);
        node.y(finalY);

        // Call the callback with final position
        onDragEnd(finalX, finalY);
    };

    // Handle click with custom double-click detection and drag threshold
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Subtle shadow to lift entities above the pitch surface
    const shadowProps = {
        shadowEnabled: true,
        shadowColor: 'rgba(0,0,0,0.35)',
        shadowBlur: 4,
        shadowOffsetX: 1,
        shadowOffsetY: 2,
        shadowOpacity: 0.4,
    };

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
                /* Ball: Oval/ellipse shape approximating a rugby ball (~1.5:1 ratio) - reduced 25% */
                <Ellipse
                    radiusX={14}
                    radiusY={9}
                    fill={color}
                    stroke={DESIGN_TOKENS.colours.primary}
                    strokeWidth={isSelected ? 2 : 1}
                    {...shadowProps}
                    opacity={opacity}
                />
            ) : entity.type === 'cone' ? (
                /* Cone: Hollow circle (stroke only, no fill) */
                <Circle
                    radius={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={7} // Increased from 3 to 7 for better visibility (LOW-001)
                    shadowEnabled={false}
                    opacity={opacity}
                />
            ) : entity.type === 'tackle-shield' ? (
                /* Tackle Shield: Body with a grip handle */
                <Group rotation={getRotationAngle(entity.orientation)}>
                    <Rect
                        width={28}
                        height={20}
                        offsetX={14}
                        offsetY={10}
                        fill={color}
                        stroke={DESIGN_TOKENS.colours.primary}
                        strokeWidth={isSelected ? 2 : 1}
                        {...shadowProps}
                        opacity={opacity}
                    />
                    <Rect
                        width={14}
                        height={6}
                        offsetX={7}
                        offsetY={16}
                        fill={color}
                        stroke={DESIGN_TOKENS.colours.primary}
                        strokeWidth={isSelected ? 2 : 1}
                        shadowEnabled={false}
                        opacity={opacity}
                    />
                </Group>
            ) : entity.type === 'tackle-bag' ? (
                /* Tackle Bag: Vertical rectangle shape */
                <Rect
                    width={10}
                    height={30}
                    offsetX={5}
                    offsetY={15}
                    fill={color}
                    stroke={DESIGN_TOKENS.colours.primary}
                    strokeWidth={isSelected ? 2 : 1}
                    {...shadowProps}
                    opacity={opacity}
                />
            ) : (
                /* Players: Filled circle */
                <Circle
                    radius={radius}
                    fill={color}
                    stroke={isSelected ? DESIGN_TOKENS.colours.primary : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                    {...shadowProps}
                    opacity={opacity}
                />
            )}

            {/* Label text (only for players with labels) */}
            {showLabel && (
                <Text
                    text={entity.label}
                    fontSize={11}
                    fontFamily={DESIGN_TOKENS.typography.fontBody}
                    fill={DESIGN_TOKENS.colours.textInverse}
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
