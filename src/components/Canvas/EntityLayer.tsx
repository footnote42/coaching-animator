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
    // Calculate interpolated entities when playing
    const interpolatedEntities = useMemo(() => {
        if (!playbackPosition || !frames.length) {
            return entities;
        }

        const fromFrame = frames[playbackPosition.fromFrameIndex];
        const toFrame = frames[playbackPosition.toFrameIndex];

        if (!fromFrame || !toFrame) return entities;

        const { progress } = playbackPosition;

        // Create interpolated entity positions
        return entities.map(entity => {
            const fromEntity = fromFrame.entities[entity.id];
            const toEntity = toFrame.entities[entity.id];

            // If entity exists in both frames, interpolate
            if (fromEntity && toEntity) {
                return {
                    ...entity,
                    x: fromEntity.x + (toEntity.x - fromEntity.x) * progress,
                    y: fromEntity.y + (toEntity.y - fromEntity.y) * progress,
                };
            }

            // Entity only in "from" frame - keep position (will disappear at end)
            if (fromEntity && !toEntity) {
                return { ...entity, x: fromEntity.x, y: fromEntity.y };
            }

            // Entity only in "to" frame - show at destination
            if (!fromEntity && toEntity) {
                return { ...entity, x: toEntity.x, y: toEntity.y };
            }

            return entity;
        });
    }, [entities, playbackPosition, frames]);

    return (
        <Layer listening={interactive}>
            {interpolatedEntities.map((entity) => (
                <PlayerToken
                    key={entity.id}
                    entity={entity}
                    isSelected={selectedEntityId === entity.id}
                    draggable={interactive}
                    onSelect={() => onEntitySelect(entity.id)}
                    onDragEnd={(x, y) => onEntityMove(entity.id, x, y)}
                    onDoubleClick={() => onEntityDoubleClick(entity.id)}
                    onContextMenu={(event) => onEntityContextMenu(entity.id, event)}
                />
            ))}
        </Layer>
    );
};

