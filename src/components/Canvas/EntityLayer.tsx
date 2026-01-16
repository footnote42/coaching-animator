import React from 'react';
import { Layer } from 'react-konva';
import { Entity } from '../../types';
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
 */
export const EntityLayer: React.FC<EntityLayerProps> = ({
    entities,
    selectedEntityId,
    onEntitySelect,
    onEntityMove,
    onEntityDoubleClick,
    onEntityContextMenu,
    interactive
}) => {
    return (
        <Layer listening={interactive}>
            {entities.map((entity) => (
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
