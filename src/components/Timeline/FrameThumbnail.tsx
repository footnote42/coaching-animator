import React from 'react';
import { Frame } from '../../types';
import { X, Copy } from 'lucide-react';
import { DESIGN_TOKENS } from '../../constants/design-tokens';
import { Slider } from '../ui/slider';
import { VALIDATION } from '../../constants/validation';

export interface FrameThumbnailProps {
  frame: Frame;
  displayIndex: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDurationChange: (frameId: string, durationMs: number) => void;
}

export const FrameThumbnail: React.FC<FrameThumbnailProps> = ({
  frame,
  displayIndex,
  isActive,
  onClick,
  onDelete,
  onDuplicate,
  onDurationChange,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [durationValue, setDurationValue] = React.useState(frame.duration / 1000);

  // Sync local state with prop if it changes externally
  React.useEffect(() => {
    setDurationValue(frame.duration / 1000);
  }, [frame.duration]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  };

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setDurationValue(newValue);
    onDurationChange(frame.id, newValue * 1000);
  };

  return (
    <div
      className="relative flex flex-col items-center gap-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail preview */}
      <div
        className={`
          w-16 h-12
          border
          ${isActive ? 'border-2' : 'border'}
          ${isActive ? 'border-pitch-green' : 'border-tactical-mono-300'}
          bg-tactical-mono-50
          flex items-center justify-center
          font-mono text-sm
          hover:bg-tactical-mono-100
          transition-colors
          relative
        `}
        style={{
          borderColor: isActive ? DESIGN_TOKENS.colors.primary : undefined,
          borderRadius: 0, // Sharp corners
        }}
        onClick={onClick}
      >
        <span className="font-mono text-xs text-tactical-mono-700 select-none">
          {displayIndex}
        </span>
      </div>

      {/* Frame info & Slider */}
      <div className="flex flex-col items-center w-full gap-1 px-1">
        <span className="font-mono text-[10px] text-tactical-mono-600 tabular-nums">
          {durationValue.toFixed(1)}s
        </span>
        <div className="w-full px-1" onClick={(e) => e.stopPropagation()}>
          <Slider
            value={[durationValue]}
            min={VALIDATION.FRAME.DURATION_MIN_MS / 1000}
            max={VALIDATION.FRAME.DURATION_MAX_MS / 1000}
            step={0.1}
            onValueChange={handleSliderChange}
            className="[&_[role=slider]]:h-2 [&_[role=slider]]:w-2 [&_[role=slider]]:rounded-none [&_.relative]:h-1"
          />
        </div>
      </div>

      {/* Hover actions */}
      {isHovered && (
        <div className="absolute top-0 right-0 flex gap-1 p-0.5">
          <button
            onClick={handleDuplicate}
            className="p-0.5 bg-tactical-mono-100 hover:bg-tactical-mono-200 border border-tactical-mono-300"
            style={{ borderRadius: 0 }}
            title="Duplicate frame"
          >
            <Copy size={10} />
          </button>
          <button
            onClick={handleDelete}
            className="p-0.5 bg-tactical-mono-100 hover:bg-red-100 border border-tactical-mono-300"
            style={{ borderRadius: 0 }}
            title="Delete frame"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
};
