import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Repeat, Ghost, Grid } from 'lucide-react';
import { PlaybackSpeed } from '../../types';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  loopEnabled: boolean;
  currentFrame: number;
  totalFrames: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onPreviousFrame: () => void;
  onNextFrame: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onLoopToggle: () => void;
  ghostEnabled: boolean;
  onGhostToggle: () => void;
  gridEnabled: boolean;
  onGridToggle: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  speed,
  loopEnabled,
  currentFrame,
  totalFrames,
  onPlay,
  onPause,
  onReset,
  onPreviousFrame,
  onNextFrame,
  onSpeedChange,
  onLoopToggle,
  ghostEnabled,
  onGhostToggle,
  gridEnabled,
  onGridToggle,
}) => {
  const speedOptions: PlaybackSpeed[] = [0.5, 1, 2];

  return (
    <div className="flex items-center gap-4 p-2 bg-[var(--color-surface-warm)] border-b border-[var(--color-accent-warm)]">
      {/* Play/Pause/Reset controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2 hover:bg-[var(--color-accent-warm)] hover:text-white border border-[var(--color-accent-warm)] rounded"
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={onReset}
          className="p-2 hover:bg-[var(--color-accent-warm)] hover:text-white border border-[var(--color-accent-warm)] rounded"
          title="Reset to frame 1"
          aria-label="Reset to frame 1"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Frame navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousFrame}
          className="p-2 hover:bg-[var(--color-accent-warm)] hover:text-white border border-[var(--color-accent-warm)] rounded"
          title="Previous frame"
          aria-label="Previous frame"
          disabled={currentFrame === 0}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-mono text-sm px-2 text-[var(--color-text-primary)]">
          {currentFrame + 1}/{totalFrames}
        </span>
        <button
          onClick={onNextFrame}
          className="p-2 hover:bg-[var(--color-accent-warm)] hover:text-white border border-[var(--color-accent-warm)] rounded"
          title="Next frame"
          aria-label="Next frame"
          disabled={currentFrame >= totalFrames - 1}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs text-[var(--color-text-primary)]">Speed:</span>
        {speedOptions.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`
              px-2 py-1
              font-mono text-xs
              border border-[var(--color-accent-warm)]
              ${speed === s ? 'bg-[var(--color-accent-warm)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-accent-warm)] hover:text-white'}
            `}
            title={`${s}x speed`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Loop toggle */}
      <button
        onClick={onLoopToggle}
        className={`
          p-2
          border border-[var(--color-accent-warm)]
          rounded
          ${loopEnabled ? 'bg-[var(--color-accent-warm)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-accent-warm)] hover:text-white'}
        `}
        title={loopEnabled ? 'Loop enabled' : 'Loop disabled'}
        aria-label={loopEnabled ? 'Disable loop' : 'Enable loop'}
      >
        <Repeat size={16} />
      </button>

      {/* Ghost Mode toggle */}
      <button
        onClick={onGhostToggle}
        className={`
          p-2
          border border-[var(--color-accent-warm)]
          rounded-none
          ${ghostEnabled ? 'bg-[var(--color-accent-warm)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-accent-warm)] hover:text-white'}
        `}
        title={ghostEnabled ? 'Ghost mode enabled' : 'Ghost mode disabled'}
        aria-label={ghostEnabled ? 'Disable ghost mode' : 'Enable ghost mode'}
      >
        <Ghost size={16} />
      </button>

      {/* Grid overlay toggle */}
      <button
        onClick={onGridToggle}
        className={`
          p-2
          border border-[var(--color-accent-warm)]
          rounded-none
          ${gridEnabled ? 'bg-[var(--color-accent-warm)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-accent-warm)] hover:text-white'}
        `}
        title={gridEnabled ? 'Grid overlay enabled' : 'Grid overlay disabled'}
        aria-label={gridEnabled ? 'Disable grid overlay' : 'Enable grid overlay'}
      >
        <Grid size={16} />
      </button>
    </div>
  );
};
