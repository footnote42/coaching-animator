import React from 'react';
import { Frame } from '@/core/types';
import { FrameThumbnail } from './FrameThumbnail';
import { Plus } from 'lucide-react';

export interface FrameStripProps {
  frames: Frame[];
  currentFrameIndex: number;
  onFrameSelect: (index: number) => void;
  onAddFrame: () => void;
  onRemoveFrame: (frameId: string) => void;
  onDuplicateFrame: (frameId: string) => void;
  onDurationChange: (frameId: string, durationMs: number) => void;
  maxFrames?: number;
  isAuthenticated?: boolean;
  onShowGuestLimitModal?: () => void;
  orientation?: 'horizontal' | 'vertical';
}

export const FrameStrip: React.FC<FrameStripProps> = ({
  frames,
  currentFrameIndex,
  onFrameSelect,
  onAddFrame,
  onRemoveFrame,
  onDuplicateFrame,
  onDurationChange,
  maxFrames = 50,
  isAuthenticated = false,
  onShowGuestLimitModal,
  orientation = 'horizontal',
}) => {
  const isAtLimit = frames.length >= maxFrames;
  const showLimitWarning = isAtLimit && !isAuthenticated;
  const isVertical = orientation === 'vertical';

  return (
    <div className={`flex ${isVertical ? 'flex-col items-center' : 'items-center'} gap-4 p-4 ${isVertical ? 'overflow-y-auto' : 'overflow-x-auto'} scrollbar-thin scrollbar-thumb-border`}>
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
          onDurationChange={onDurationChange}
        />
      ))}

      {/* Add Frame button */}
      <button
        onClick={onAddFrame}
        className={`
          flex items-center justify-center
          w-16 h-12
          border border-[var(--color-accent-warm)]
          transition-colors
          font-mono text-xs
          ${isAtLimit 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-[var(--color-surface)] hover:bg-[var(--color-accent-warm)] hover:text-white'}
        `}
        title={isAtLimit 
          ? (isAuthenticated ? 'Maximum frames reached' : 'Register for more frames') 
          : 'Add frame'}
        aria-label={isAtLimit ? 'Frame limit reached' : 'Add new frame'}
      >
        <Plus size={16} />
      </button>

      {/* Guest limit indicator */}
      {showLimitWarning && (
        <button
          onClick={onShowGuestLimitModal}
          className="ml-2 px-3 py-1 text-xs bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          Unlock more frames
        </button>
      )}
    </div>
  );
};
