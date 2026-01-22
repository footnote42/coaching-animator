import { Entity } from '../../types';
import { Input } from '../ui/input';
import { ColorPicker } from '../ui/ColorPicker';
import { Button } from '../ui/button';

export interface EntityPropertiesProps {
    /** Selected entity to edit */
    entity: Entity | null;

    /** Called when entity properties are updated */
    onUpdate: (updates: Partial<Entity>) => void;
}

/**
 * EntityProperties sidebar component.
 * Displays editable properties for the selected entity.
 */
export function EntityProperties({ entity, onUpdate }: EntityPropertiesProps) {
    if (!entity) {
        return (
            <div className="p-4 text-sm text-tactical-mono-500">
                No entity selected
            </div>
        );
    }

    const isPlayer = entity.type === 'player';

    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="text-sm font-semibold text-tactical-mono-700">
                Entity Properties
            </h3>

            {/* Entity Type (read-only) */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-tactical-mono-700">
                    Type
                </label>
                <div className="px-3 py-2 text-sm bg-tactical-mono-100 border border-tactical-mono-300 font-mono">
                    {entity.type}
                </div>
            </div>

            {/* Label (editable for players) */}
            {isPlayer && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-tactical-mono-700">
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
                    <label className="text-xs font-semibold text-tactical-mono-700">
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

            {/* Color */}
            <ColorPicker
                label="Color"
                value={entity.color || '#1A3D1A'}
                onChange={(color) => onUpdate({ color })}
            />
        </div>
    );
}
