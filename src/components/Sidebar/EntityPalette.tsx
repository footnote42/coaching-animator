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
    <div className="p-4 border-b border-[var(--color-surface-warm)]">
      <h3 className="text-sm font-semibold text-pitch-green mb-2">Entities</h3>
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onAddAttackPlayer}
          className="justify-start"
          aria-label="Add attack player"
        >
          + Attack Player
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onAddDefensePlayer}
          className="justify-start"
          aria-label="Add defense player"
        >
          + Defense Player
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddBall}
          className="justify-start"
          aria-label="Add ball"
        >
          + Ball
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddCone}
          className="justify-start"
          aria-label="Add cone"
        >
          + Cone
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddMarker}
          className="justify-start"
          aria-label="Add marker"
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
          aria-label={drawingMode === 'arrow' ? 'Disable arrow drawing' : 'Enable arrow drawing'}
        >
          Arrow →
        </Button>
        <Button
          variant={drawingMode === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={handleLineClick}
          className="flex-1"
          aria-label={drawingMode === 'line' ? 'Disable line drawing' : 'Enable line drawing'}
        >
          Line —
        </Button>
      </div>
      {drawingMode !== 'none' && (
        <p className="text-xs text-[var(--color-text-primary)] opacity-60 mt-2 font-mono">
          Click and drag on canvas to draw
        </p>
      )}
    </div>
  );
}
