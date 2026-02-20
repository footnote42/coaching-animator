'use client';

import { Plus } from 'lucide-react';
import { AnimationSummary } from '@/features/gallery/components/AnimationCard';

interface ProgressionPanelProps {
  baseTitle: string;
  progressions: Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>[];
  activeIndex: number; // -1 = base
  onSelectRequest: (index: number) => void; // triggers dirty-state check in parent
  onAddProgression: () => void;
  canAdd: boolean; // false when progression_count >= 5
  isAdding: boolean; // true while the add async operation is in flight
}

export function ProgressionPanel({
  baseTitle,
  progressions,
  activeIndex,
  onSelectRequest,
  onAddProgression,
  canAdd,
  isAdding,
}: ProgressionPanelProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-x-auto">
      <span className="text-xs text-text-primary/50 shrink-0">Progressions:</span>

      {/* Base pill */}
      <button
        onClick={() => onSelectRequest(-1)}
        className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
          activeIndex === -1
            ? 'bg-primary text-text-inverse border-primary'
            : 'bg-transparent text-text-primary/70 border-border hover:border-primary hover:text-text-primary'
        }`}
        title={baseTitle}
      >
        Base
      </button>

      {/* Progression pills */}
      {progressions.map((prog, i) => (
        <button
          key={prog.id}
          onClick={() => onSelectRequest(i)}
          className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
            activeIndex === i
              ? 'bg-primary text-text-inverse border-primary'
              : 'bg-transparent text-text-primary/70 border-border hover:border-primary hover:text-text-primary'
          }`}
          title={prog.title}
        >
          P{prog.progression_order ?? i + 1}
        </button>
      ))}

      {/* Add progression button */}
      <button
        onClick={onAddProgression}
        disabled={!canAdd || isAdding}
        className={`shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
          canAdd && !isAdding
            ? 'border-dashed border-border text-text-primary/50 hover:border-primary hover:text-primary'
            : 'border-dashed border-border/30 text-text-primary/20 cursor-not-allowed'
        }`}
        title={!canAdd ? 'Maximum 5 progressions reached' : 'Add progression'}
      >
        <Plus className="w-3 h-3" />
        {isAdding ? 'Adding…' : 'Add'}
      </button>

      {!canAdd && (
        <span className="text-xs text-text-primary/30 shrink-0">Max 5</span>
      )}
    </div>
  );
}
