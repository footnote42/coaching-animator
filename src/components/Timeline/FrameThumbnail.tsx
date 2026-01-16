import React from 'react';
import { Frame } from '../../types';
import { X, Copy } from 'lucide-react';
import { DESIGN_TOKENS } from '../../constants/design-tokens';

export interface FrameThumbnailProps {
  frame: Frame;
  displayIndex: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const FrameThumbnail: React.FC<FrameThumbnailProps> = ({
  frame,
  displayIndex,
  isActive,
  onClick,
  onDelete,
  onDuplicate,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  };

  return (
    <div
      className="relative flex flex-col items-center gap-1 cursor-pointer"
      onClick={onClick}
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
        `}
        style={{
          borderColor: isActive ? DESIGN_TOKENS.colors.primary : undefined,
        }}
      >
        <span className="font-mono text-xs text-tactical-mono-700">
          {displayIndex}
        </span>
      </div>

      {/* Frame info */}
      <div className="flex flex-col items-center">
        <span className="font-mono text-xs text-tactical-mono-600">
          {(frame.duration / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Hover actions */}
      {isHovered && (
        <div className="absolute top-0 right-0 flex gap-1 p-1">
          <button
            onClick={handleDuplicate}
            className="p-0.5 bg-tactical-mono-100 hover:bg-tactical-mono-200 border border-tactical-mono-300 rounded"
            title="Duplicate frame"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-0.5 bg-tactical-mono-100 hover:bg-red-100 border border-tactical-mono-300 rounded"
            title="Delete frame"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
