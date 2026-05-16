import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { ColorPicker } from '@/shared/ui/ColorPicker';
import { DrawingMode } from '@/core/types';

export interface EntityPaletteProps {
  onAddAttackPlayer: () => void;
  onAddDefensePlayer: () => void;
  onAddOtherPlayer: () => void;
  onAddBall: () => void;
  onAddCone: () => void;
  onAddTackleShield: () => void;
  onAddTackleBag: () => void;

  teamColors: { attack: string; defense: string; other: string };
  onTeamColorChange: (team: 'attack' | 'defense' | 'other', color: string) => void;

  /** @deprecated Marker button removed - kept for backwards compatibility */
  onAddMarker?: () => void;

  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
}

const TEAM_LABELS: Record<'attack' | 'defense' | 'other', string> = {
  attack: 'Attack',
  defense: 'Defence',
  other: 'Other Role',
};

export function EntityPalette({
  onAddAttackPlayer,
  onAddDefensePlayer,
  onAddOtherPlayer,
  onAddBall,
  onAddCone,
  onAddTackleShield,
  onAddTackleBag,
  teamColors,
  onTeamColorChange,
  drawingMode,
  onDrawingModeChange,
}: EntityPaletteProps) {
  const [openPicker, setOpenPicker] = useState<'attack' | 'defense' | 'other' | null>(null);

  const handleArrowClick = () => {
    onDrawingModeChange(drawingMode === 'arrow' ? 'none' : 'arrow');
  };

  const handleLineClick = () => {
    onDrawingModeChange(drawingMode === 'line' ? 'none' : 'line');
  };

  const togglePicker = (team: 'attack' | 'defense' | 'other') => {
    setOpenPicker(prev => (prev === team ? null : team));
  };

  return (
    <div className="p-4 border-b border-[var(--color-surface-warm)]">
      <h3 className="text-sm font-semibold text-pitch-green mb-2">Entities</h3>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddAttackPlayer}
          className="justify-start"
          aria-label="Add attack player"
        >
          + Attack Player
        </Button>
        <Button
          variant="outline"
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
          onClick={onAddOtherPlayer}
          className="justify-start"
          aria-label="Add other role player"
        >
          + Other Role
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
      </div>

      <h3 className="text-sm font-semibold text-pitch-green mt-4 mb-2">Team Colours</h3>
      <div className="flex flex-col gap-1">
        {(['attack', 'defense', 'other'] as const).map(team => (
          <div key={team}>
            <button
              onClick={() => togglePicker(team)}
              className="flex items-center gap-2 w-full px-2 py-1 text-sm text-left hover:bg-[var(--color-surface-warm)] transition-colors"
              aria-label={`Change ${TEAM_LABELS[team]} colour`}
            >
              <span
                className="inline-block w-4 h-4 flex-shrink-0 border border-[var(--color-border)]"
                style={{ backgroundColor: teamColors[team] }}
              />
              <span className="text-[var(--color-text-primary)]">{TEAM_LABELS[team]}</span>
            </button>
            {openPicker === team && (
              <div className="mt-1 mb-1">
                <ColorPicker
                  value={teamColors[team]}
                  onChange={(color) => onTeamColorChange(team, color)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-pitch-green mt-4 mb-2">Equipment</h3>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTackleShield}
          className="justify-start"
          aria-label="Add tackle shield"
        >
          + Tackle Shield
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTackleBag}
          className="justify-start"
          aria-label="Add tackle bag"
        >
          + Tackle Bag
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
