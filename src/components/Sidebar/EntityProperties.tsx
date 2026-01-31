import { Entity, Annotation } from '../../types';
import { Input } from '../ui/input';
import { ColorPicker } from '../ui/ColorPicker';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';

export interface EntityPropertiesProps {
    /** Selected entity to edit */
    entity: Entity | null;

    /** Called when entity properties are updated */
    onUpdate: (updates: Partial<Entity>) => void;
}

/**
 * EntityProperties sidebar component.
 * Displays editable properties for the selected entity or annotation.
 */
export function EntityProperties({ entity, onUpdate }: EntityPropertiesProps) {
    const { project, currentFrameIndex, updateAnnotation } = useProjectStore();
    const { selectedAnnotationId } = useUIStore();

    // Get selected annotation from current frame
    const currentFrame = project?.frames[currentFrameIndex];
    const selectedAnnotation = selectedAnnotationId && currentFrame
        ? currentFrame.annotations.find((a: Annotation) => a.id === selectedAnnotationId)
        : null;

    // Get players from the current frame for possession dropdown
    const currentPlayers = project && project.frames[currentFrameIndex]
        ? Object.values(project.frames[currentFrameIndex].entities).filter(e => e.type === 'player')
        : [];

    // If annotation is selected, show annotation properties
    if (selectedAnnotation && project) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    Annotation: {selectedAnnotation.type.charAt(0).toUpperCase() + selectedAnnotation.type.slice(1)} ({selectedAnnotation.id.slice(0, 4)})
                </h3>

                {/* Annotation Type (read-only) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Type
                    </label>
                    <div className="px-3 py-2 text-sm bg-[var(--color-surface-warm)] border border-[var(--color-border)] font-mono capitalize">
                        {selectedAnnotation.type}
                    </div>
                </div>

                {/* Start Frame */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Start Frame
                    </label>
                    <Select
                        value={selectedAnnotation.startFrameId}
                        onValueChange={(value) => updateAnnotation(selectedAnnotation.id, { startFrameId: value })}
                    >
                        <SelectTrigger className="font-mono">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {project.frames.map((frame, idx) => (
                                <SelectItem key={frame.id} value={frame.id}>
                                    Frame {idx + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-[var(--color-text-primary)] opacity-60">Annotation visible from this frame onward</span>
                </div>

                {/* End Frame */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        End Frame
                    </label>
                    <Select
                        value={selectedAnnotation.endFrameId}
                        onValueChange={(value) => updateAnnotation(selectedAnnotation.id, { endFrameId: value })}
                    >
                        <SelectTrigger className="font-mono">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {project.frames.map((frame, idx) => (
                                <SelectItem
                                    key={frame.id}
                                    value={frame.id}
                                    disabled={project.frames.findIndex(f => f.id === frame.id) < project.frames.findIndex(f => f.id === selectedAnnotation.startFrameId)}
                                >
                                    Frame {idx + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-[var(--color-text-primary)] opacity-60">Annotation visible from start to end frame</span>
                </div>

                <ColorPicker
                    label="Colour"
                    value={selectedAnnotation.color || '#FACC15'}
                    onChange={(color) => updateAnnotation(selectedAnnotation.id, { color })}
                />
            </div>
        );
    }

    // Otherwise show entity properties
    if (!entity) {
        return (
            <div className="p-4 text-sm text-[var(--color-text-primary)] opacity-60">
                No entity selected
            </div>
        );
    }

    const isPlayer = entity.type === 'player';
    const isBall = entity.type === 'ball';

    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                Entity: {entity.label || (entity.id ? `Unnamed ${entity.type} (${entity.id.slice(0, 4)})` : entity.type)}
            </h3>

            {/* Entity Type (read-only) */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Type
                </label>
                <div className="px-3 py-2 text-sm bg-[var(--color-surface-warm)] border border-[var(--color-border)] font-mono capitalize">
                    {entity.type}
                </div>
            </div>

            {/* Label (editable for players) */}
            {isPlayer && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Label (Jersey #)
                    </label>
                    <Input
                        type="text"
                        value={entity.label || ''}
                        onChange={(e) => onUpdate({ label: e.target.value })}
                        maxLength={10}
                        placeholder="e.g. 10"
                        className="font-mono"
                    />
                </div>
            )}

            {/* Team (editable for players) */}
            {isPlayer && (
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Team
                    </label>
                    <div className="flex gap-2">
                        <Button
                            variant={entity.team === 'attack' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdate({ team: 'attack' })}
                            className="flex-1"
                        >
                            Attack
                        </Button>
                        <Button
                            variant={entity.team === 'defense' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdate({ team: 'defense' })}
                            className="flex-1"
                        >
                            Defense
                        </Button>
                        <Button
                            variant={entity.team === 'neutral' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdate({ team: 'neutral' })}
                            className="flex-1"
                        >
                            Neutral
                        </Button>
                    </div>
                </div>
            )}

            {/* Possession (editable for ball) */}
            {isBall && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Possession
                    </label>
                    <Select
                        value={entity.parentId || 'none'}
                        onValueChange={(value) => onUpdate({ parentId: value === 'none' ? undefined : value })}
                    >
                        <SelectTrigger className="font-mono bg-[var(--color-surface-warm)]">
                            <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {currentPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                    {player.label || `Player ${player.id.slice(0, 4)}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Colour */}
            <ColorPicker
                label="Colour"
                value={entity.color || '#1A3D1A'}
                onChange={(color) => onUpdate({ color })}
            />
        </div>
    );
}
