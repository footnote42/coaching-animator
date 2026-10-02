'use client';

import { toast } from 'sonner';
import React, { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { MiniPitchSVG } from './MiniPitchSVG';
import { Unlink, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { fetchWithRetry, deleteWithRetry } from '@/lib/api-client';

interface ProgressionPreview {
  id: string;
  title: string;
  progression_order: number;
  preview_entities: Array<{ x: number; y: number; team: 'attack' | 'defense' | 'neutral' }> | null;
}

interface ProgressionStripProps {
  parentId: string;
  progressionCount: number;
  isEditable?: boolean;
  onProgressionUpdated?: () => void;
}

/**
 * ProgressionStrip
 *
 * Always-visible compact horizontal strip beneath a parent gallery card.
 * Fetches public progression children from /api/gallery/[id]/progressions.
 * Each item shows a MiniPitchSVG with a numbered stamp overlay.
 * Touch-swipeable (CSS scroll snap) and keyboard-navigable.
 */
export function ProgressionStrip({ parentId, progressionCount, isEditable, onProgressionUpdated }: ProgressionStripProps) {
  const [progressions, setProgressions] = useState<ProgressionPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [actionItem, setActionItem] = useState<{ id: string; type: 'unlink' | 'rename' | 'delete'; title: string } | null>(null);
  const [isActing, setIsActing] = useState(false);

  const fetchProgressions = React.useCallback(() => {
    if (progressionCount === 0) return;
    setLoading(true);
    fetch(`/api/gallery/${parentId}/progressions`)
      .then((res) => res.json())
      .then((data: { progressions: ProgressionPreview[] }) => {
        setProgressions(data.progressions ?? []);
      })
      .catch(() => setProgressions([]))
      .finally(() => setLoading(false));
  }, [parentId, progressionCount]);

  useEffect(() => {
    fetchProgressions();
  }, [fetchProgressions]);

  const handleActionConfirm = async () => {
    if (!actionItem) return;
    setIsActing(true);
    try {
      if (actionItem.type === 'unlink') {
        const res = await fetchWithRetry(`/api/animations/${actionItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parent_animation_id: null, is_progression: false, progression_order: 0 }),
        });
        if (!res.ok) throw new Error('Failed to unlink');
        onProgressionUpdated?.();

      } else if (actionItem.type === 'delete') {
        const res = await deleteWithRetry(`/api/animations/${actionItem.id}`);
        if (!res.ok) throw new Error('Failed to delete');
        onProgressionUpdated?.();
      }
      setActionItem(null);
    } catch (err) {
      console.error('[Progression] Action error:', err);
      toast.error("That didn't work. Please try again.");
    } finally {
      setIsActing(false);
    }
  };

  // Nothing to show
  if (progressionCount === 0) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      itemRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      itemRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      className="px-2 pb-2 pt-1 border-t border-border bg-surface-warm"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-[10px] tracking-widest font-medium uppercase text-text-primary/50 mb-1">
        Progressions
      </p>

      {loading ? (
        // Skeleton placeholders
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-none w-16 aspect-square bg-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          role="list"
          className="flex overflow-x-auto gap-2 snap-x snap-mandatory py-0.5"
          style={{ scrollbarWidth: 'none' }}
        >
          {progressions.map((p, index) => (
            <a
              key={p.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              role="listitem"
              href={`/share/${p.id}`}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="snap-start flex-none w-16 aspect-square relative block border border-border hover:border-primary transition-colors group"
              aria-label={`Progression ${p.progression_order}: ${p.title}`}
            >
              <MiniPitchSVG
                entities={p.preview_entities ?? null}
                className="w-full h-full"
              />
              {/* Numbered stamp overlay */}
              <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-primary text-text-inverse text-[9px] font-bold flex items-center justify-center leading-none">
                {p.progression_order}
              </span>

              {/* Editable Actions Overlay */}
              {isEditable && (
                <div className="absolute top-0 right-0 bottom-0 w-5 bg-surface/90 border-l border-border flex flex-col items-center justify-between py-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10" onClick={(e) => e.preventDefault()}>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActionItem({ id: p.id, type: 'unlink', title: p.title }); }} className="p-0.5 text-text-primary/70 hover:text-primary transition-colors" title="Make base animation (Unlink)"><Unlink className="w-3 h-3" /></button>
                  <button onClick={async (e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    const newTitle = window.prompt(`Rename "${p.title}"`, p.title);
                    if (newTitle && newTitle.trim() && newTitle !== p.title) {
                      setIsActing(true);
                      try {
                        const res = await fetchWithRetry(`/api/animations/${p.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: newTitle.trim() }),
                        });
                        if (!res.ok) throw new Error('Failed to rename');
                        fetchProgressions();
                      } catch (err) {
                        console.error('[Progression] Rename error:', err);
                        toast.error("Couldn't rename that animation. Please try again.");
                      } finally {
                        setIsActing(false);
                      }
                    }
                  }} className="p-0.5 text-text-primary/70 hover:text-primary transition-colors" title="Rename"><Pencil className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActionItem({ id: p.id, type: 'delete', title: p.title }); }} className="p-0.5 text-red-500 hover:text-red-700 transition-colors" title="Delete"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Action Dialogs */}
      {actionItem?.type === 'unlink' && (
        <ConfirmDialog
          open={true}
          title="Unlink Progression"
          description={`Are you sure you want to unlink "${actionItem.title}"? It will become a standalone base animation.`}
          confirmLabel={isActing ? 'Unlinking...' : 'Unlink'}
          cancelLabel="Cancel"
          onConfirm={handleActionConfirm}
          onCancel={() => setActionItem(null)}
          variant="default"
        />
      )}
      {actionItem?.type === 'delete' && (
        <ConfirmDialog
          open={true}
          title="Delete Progression"
          description={`Deleting "${actionItem.title}" cannot be undone.`}
          confirmLabel={isActing ? 'Deleting...' : 'Delete'}
          cancelLabel="Cancel"
          onConfirm={handleActionConfirm}
          onCancel={() => setActionItem(null)}
          variant="destructive"
        />
      )}
    </div>
  );
}
