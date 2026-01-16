import React from 'react';
import { Frame } from '../../types';
import { FrameThumbnail } from './FrameThumbnail';
import { Plus } from 'lucide-react';

export interface FrameStripProps {
  frames: Frame[];
  currentFrameIndex: number;
  onFrameSelect: (index: number) => void;
  onAddFrame: () => void;
  onRemoveFrame: (frameId: string) => void;
  onDuplicateFrame: (frameId: string) => void;
}

export const FrameStrip: React.FC<FrameStripProps> = ({
  frames,
  currentFrameIndex,
  onFrameSelect,
  onAddFrame,
  onRemoveFrame,
  onDuplicateFrame,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-tactical-mono-50 border-t border-tactical-mono-300 overflow-x-auto">
      {/* Frame thumbnails */}
      {frames.map((frame, index) => (
        <FrameThumbnail
          key={frame.id}
          frame={frame}
          displayIndex={index + 1}
          isActive={index === currentFrameIndex}
          onClick={() => onFrameSelect(index)}
          onDelete={() => onRemoveFrame(frame.id)}
          onDuplicate={() => onDuplicateFrame(frame.id)}
        />
      ))}

      {/* Add Frame button */}
      <button
        onClick={onAddFrame}
        className="
          flex items-center justify-center
          w-16 h-12
          border border-tactical-mono-300
          bg-tactical-mono-100
          hover:bg-tactical-mono-200
          transition-colors
          font-mono text-xs
        "
        title="Add frame"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
