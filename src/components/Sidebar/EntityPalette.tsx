import { Button } from '../ui/button';

export interface EntityPaletteProps {
  /** Called when attack player button clicked */
  onAddAttackPlayer: () => void;

  /** Called when defense player button clicked */
  onAddDefensePlayer: () => void;

  /** Called when ball button clicked */
  onAddBall: () => void;

  /** Called when cone button clicked */
  onAddCone: () => void;

  /** Called when marker button clicked */
  onAddMarker: () => void;
}

/**
 * Entity palette sidebar component.
 * Provides buttons to add different entity types to the canvas.
 */
export function EntityPalette({
  onAddAttackPlayer,
  onAddDefensePlayer,
  onAddBall,
  onAddCone,
  onAddMarker
}: EntityPaletteProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-tactics-white">Entities</h3>
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onAddAttackPlayer}
          className="justify-start"
        >
          + Attack Player
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onAddDefensePlayer}
          className="justify-start"
        >
          + Defense Player
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddBall}
          className="justify-start"
        >
          + Ball
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddCone}
          className="justify-start"
        >
          + Cone
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddMarker}
          className="justify-start"
        >
          + Marker
        </Button>
      </div>
    </div>
  );
}
