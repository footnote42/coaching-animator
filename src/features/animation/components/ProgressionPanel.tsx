'use client';

import { Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimationSummary } from '@/features/gallery/components/AnimationCard';

interface ProgressionPanelProps {
  baseTitle: string;
  progressions: Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>[];
  activeIndex: number; // -1 = base
  onSelectRequest: (index: number) => void; // triggers dirty-state check in parent
  onAddProgression: () => void;
  onReorder: (newOrder: Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>[]) => void;
  canAdd: boolean; // false when progression_count >= 5
  isAdding: boolean; // true while the add async operation is in flight
}

interface SortablePillProps {
  prog: Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>;
  index: number;
  isActive: boolean;
  onSelectRequest: (index: number) => void;
}

function SortablePill({ prog, index, isActive, onSelectRequest }: SortablePillProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prog.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="shrink-0 flex items-center"
    >
      <button
        onClick={() => onSelectRequest(index)}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
          isActive
            ? 'bg-primary text-text-inverse border-primary'
            : 'bg-transparent text-text-primary/70 border-border hover:border-primary hover:text-text-primary'
        }`}
        title={prog.title}
      >
        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-current opacity-40 hover:opacity-70 -ml-0.5"
          onClick={e => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-3 h-3" />
        </span>
        P{prog.progression_order ?? index + 1}
      </button>
    </div>
  );
}

export function ProgressionPanel({
  baseTitle,
  progressions,
  activeIndex,
  onSelectRequest,
  onAddProgression,
  onReorder,
  canAdd,
  isAdding,
}: ProgressionPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = progressions.findIndex(p => p.id === active.id);
    const newIndex = progressions.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...progressions];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Reassign progression_order (1-based)
    const withNewOrder = reordered.map((p, i) => ({ ...p, progression_order: i + 1 }));
    onReorder(withNewOrder);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] max-h-16 overflow-hidden">
      <span className="text-xs text-text-primary/50 shrink-0">Progressions:</span>

      <div className="flex-1 min-w-0 overflow-x-auto flex items-center gap-2">
        {/* Base pill — fixed, not draggable */}
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

        {/* Sortable progression pills */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={progressions.map(p => p.id)} strategy={horizontalListSortingStrategy}>
            {progressions.map((prog, i) => (
              <SortablePill
                key={prog.id}
                prog={prog}
                index={i}
                isActive={activeIndex === i}
                onSelectRequest={onSelectRequest}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Fixed action wrapper */}
      <div className="flex-shrink-0 ml-2 flex items-center gap-2">
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
    </div>
  );
}
