import { Button } from '../ui/button';
import { DrawingMode } from '../../types';

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

  /** Current drawing mode */
  drawingMode: DrawingMode;

  /** Called to change drawing mode */
  onDrawingModeChange: (mode: DrawingMode) => void;
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
  onAddMarker,
  drawingMode,
  onDrawingModeChange,
}: EntityPaletteProps) {
  const handleArrowClick = () => {
    onDrawingModeChange(drawingMode === 'arrow' ? 'none' : 'arrow');
  };

  const handleLineClick = () => {
    onDrawingModeChange(drawingMode === 'line' ? 'none' : 'line');
  };

  return (
    <div className="p-4 border-b border-tactical-mono-200">
      <h3 className="text-sm font-semibold text-pitch-green mb-2">Entities</h3>
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

      <h3 className="text-sm font-semibold text-pitch-green mt-4 mb-2">Annotations</h3>
      <div className="flex gap-2">
        <Button
          variant={drawingMode === 'arrow' ? 'default' : 'outline'}
          size="sm"
          onClick={handleArrowClick}
          className="flex-1"
        >
          Arrow →
        </Button>
        <Button
          variant={drawingMode === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={handleLineClick}
          className="flex-1"
        >
          Line —
        </Button>
      </div>
      {drawingMode !== 'none' && (
        <p className="text-xs text-tactical-mono-500 mt-2 font-mono">
          Click and drag on canvas to draw
        </p>
      )}
    </div>
  );
}
