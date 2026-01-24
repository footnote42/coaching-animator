import React, { useMemo } from 'react';
import { Layer } from 'react-konva';
import { Entity, Frame, PlaybackPosition } from '../../types';
import { PlayerToken } from './PlayerToken';

/**
 * Props for the EntityLayer component
 */
export interface EntityLayerProps {
    /** Entities to render */
    entities: Entity[];
    /** ID of currently selected entity (for highlight) */
    selectedEntityId: string | null;
    /** Called when entity is clicked/selected */
    onEntitySelect: (entityId: string) => void;
    /** Called when entity drag ends with new position */
    onEntityMove: (entityId: string, x: number, y: number) => void;
    /** Called when entity is double-clicked (for label editing) */
    onEntityDoubleClick: (entityId: string) => void;
    /** Called when entity right-click (for context menu) */
    onEntityContextMenu: (entityId: string, event: { x: number; y: number }) => void;
    /** Whether layer is interactive (false during playback) */
    interactive: boolean;
    /** Current playback position for interpolation */
    playbackPosition: PlaybackPosition | null;
    /** All frames in the project for interpolation */
    frames: Frame[];
}

/**
 * Layer containing all interactive entities (players, ball, markers, cones).
 * Orchestrates rendering of entity tokens and manages user interactions.
 *
 * Responsibilities:
 * - Renders all entities using PlayerToken components
 * - Manages selection highlighting
 * - Handles drag interactions and position updates
 * - Disables interactions during playback
 * - Delegates all state changes through callback props
 * - Interpolates entity positions during playback for smooth animation
 */
export const EntityLayer: React.FC<EntityLayerProps> = ({
    entities,
    selectedEntityId,
    onEntitySelect,
    onEntityMove,
    onEntityDoubleClick,
    onEntityContextMenu,
    interactive,
    playbackPosition,
    frames
}) => {
    /**
     * Helper function to apply parent-relative positioning.
     * Entities with a parentId (e.g., ball with possession) will inherit
     * their parent's x/y coordinates.
     */
    const applyParentRelativePositioning = (entitiesToProcess: any[]) => {
        return entitiesToProcess.map(entity => {
            // Check if this entity has a parent (ball possession)
            if (entity.parentId) {
                // Find the parent entity in the list
                const parent = entitiesToProcess.find(e => e.id === entity.parentId);
                if (parent) {
                    // Entity follows parent's position
                    return {
                        ...entity,
                        x: parent.x,
                        y: parent.y,
                    };
                }
            }
            return entity;
        });
    };

    // Calculate interpolated entities when playing
    const interpolatedEntities = useMemo(() => {
        // Edit mode: Apply parent positioning to current entities
        if (!playbackPosition || !frames.length) {
            const entitiesWithOpacity = entities.map(e => ({ ...e, opacity: 1.0 }));
            return applyParentRelativePositioning(entitiesWithOpacity);
        }

        const fromFrame = frames[playbackPosition.fromFrameIndex];
        const toFrame = frames[playbackPosition.toFrameIndex];

        if (!fromFrame || !toFrame) {
            const entitiesWithOpacity = entities.map(e => ({ ...e, opacity: 1.0 }));
            return applyParentRelativePositioning(entitiesWithOpacity);
        }

        const { progress } = playbackPosition;

        // First pass: Calculate base interpolated positions and opacity
        const baseInterpolated = entities.map(entity => {
            const fromEntity = fromFrame.entities[entity.id];
            const toEntity = toFrame.entities[entity.id];

            // If entity exists in both frames, interpolate with full opacity
            if (fromEntity && toEntity) {
                return {
                    ...entity,
                    x: fromEntity.x + (toEntity.x - fromEntity.x) * progress,
                    y: fromEntity.y + (toEntity.y - fromEntity.y) * progress,
                    opacity: 1.0,
                };
            }

            // Entity only in "from" frame - fade out (FR-ANI-05)
            if (fromEntity && !toEntity) {
                return {
                    ...entity,
                    x: fromEntity.x,
                    y: fromEntity.y,
                    opacity: 1.0 - progress, // Fade from 1.0 to 0.0
                };
            }

            // Entity only in "to" frame - fade in
            if (!fromEntity && toEntity) {
                return {
                    ...entity,
                    x: toEntity.x,
                    y: toEntity.y,
                    opacity: progress, // Fade from 0.0 to 1.0
                };
            }

            return { ...entity, opacity: 1.0 };
        });

        // Second pass: Apply parent-relative positioning for entities with parentId
        return applyParentRelativePositioning(baseInterpolated);
    }, [entities, playbackPosition, frames]);

    return (
        <Layer listening={interactive}>
            {interpolatedEntities.map((entity: any) => (
                <PlayerToken
                    key={entity.id}
                    entity={entity}
                    isSelected={selectedEntityId === entity.id}
                    draggable={interactive && !entity.parentId}
                    onSelect={() => onEntitySelect(entity.id)}
                    onDragEnd={(x, y) => onEntityMove(entity.id, x, y)}
                    onDoubleClick={() => onEntityDoubleClick(entity.id)}
                    onContextMenu={(event) => onEntityContextMenu(entity.id, event)}
                    opacity={entity.opacity ?? 1.0}
                />
            ))}
        </Layer>
    );
};

