import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Repeat, Ghost } from 'lucide-react';
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
}) => {
  const speedOptions: PlaybackSpeed[] = [0.5, 1, 2];

  return (
    <div className="flex items-center gap-4 p-2 bg-tactical-mono-50 border-b border-tactical-mono-300">
      {/* Play/Pause/Reset controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2 hover:bg-tactical-mono-200 border border-tactical-mono-300 rounded"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={onReset}
          className="p-2 hover:bg-tactical-mono-200 border border-tactical-mono-300 rounded"
          title="Reset to frame 1"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Frame navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousFrame}
          className="p-2 hover:bg-tactical-mono-200 border border-tactical-mono-300 rounded"
          title="Previous frame"
          disabled={currentFrame === 0}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-mono text-sm px-2">
          {currentFrame + 1}/{totalFrames}
        </span>
        <button
          onClick={onNextFrame}
          className="p-2 hover:bg-tactical-mono-200 border border-tactical-mono-300 rounded"
          title="Next frame"
          disabled={currentFrame >= totalFrames - 1}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs text-tactical-mono-600">Speed:</span>
        {speedOptions.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`
              px-2 py-1
              font-mono text-xs
              border border-tactical-mono-300
              ${speed === s ? 'bg-tactical-mono-300' : 'bg-tactical-mono-100 hover:bg-tactical-mono-200'}
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
          border border-tactical-mono-300
          rounded
          ${loopEnabled ? 'bg-pitch-green text-white' : 'bg-tactical-mono-100 hover:bg-tactical-mono-200'}
        `}
        title={loopEnabled ? 'Loop enabled' : 'Loop disabled'}
      >
        <Repeat size={16} />
      </button>

      {/* Ghost Mode toggle */}
      <button
        onClick={onGhostToggle}
        className={`
          p-2
          border border-tactical-mono-300
          rounded-none
          ${ghostEnabled ? 'bg-pitch-green text-white' : 'bg-tactical-mono-100 hover:bg-tactical-mono-200'}
        `}
        title={ghostEnabled ? 'Ghost mode enabled' : 'Ghost mode disabled'}
      >
        <Ghost size={16} />
      </button>
    </div>
  );
};
