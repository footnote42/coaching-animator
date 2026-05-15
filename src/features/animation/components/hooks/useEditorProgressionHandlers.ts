import { useState } from 'react';
import { useProjectStore } from '@/core/stores/projectStore';
import { toast } from 'sonner';
import type { AnimationSummary } from '@/features/gallery/components/AnimationCard';

interface BaseAnimationMeta {
  id: string;
  title: string;
  is_progression: boolean;
}

type ProgressionItem = Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>;

interface UseEditorProgressionHandlersParams {
  cloudAnimationId: string | null;
  isAuthenticated: boolean;
  isEditMode?: boolean;
}

export function useEditorProgressionHandlers({
  cloudAnimationId,
  isAuthenticated,
  isEditMode = false,
}: UseEditorProgressionHandlersParams) {
  const loadProject = useProjectStore(s => s.loadProject);
  const isDirty = useProjectStore(s => s.isDirty);

  const [baseAnimationMeta, setBaseAnimationMeta] = useState<BaseAnimationMeta | null>(null);
  const [progressions, setProgressions] = useState<ProgressionItem[]>([]);
  const [activeProgressionIndex, setActiveProgressionIndex] = useState<number>(-1);
  const [showProgressionUnsavedDialog, setShowProgressionUnsavedDialog] = useState(false);
  const [pendingProgressionIndex, setPendingProgressionIndex] = useState<number | null>(null);
  const [isAddingProgression, setIsAddingProgression] = useState(false);

  const isBaseAnimation = !cloudAnimationId || (baseAnimationMeta !== null && !baseAnimationMeta.is_progression);
  const showProgressionPanel = isAuthenticated && !isEditMode && isBaseAnimation;

  const switchToProgression = async (index: number) => {
    setActiveProgressionIndex(index);
    const targetId = index === -1
      ? (baseAnimationMeta?.id ?? cloudAnimationId)
      : progressions[index]?.id;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/animations/${targetId}`);
      if (!res.ok) { toast.error('Failed to load progression'); return; }
      const data = await res.json();
      if (data?.payload) {
        const projectData = {
          ...data.payload,
          id: data.id || crypto.randomUUID(),
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
        };
        loadProject(projectData);
      }
    } catch (err) {
      console.error('[Editor] Failed to switch progression:', err);
      toast.error('Failed to load progression');
    }
  };

  const handleProgressionSelectRequest = (index: number) => {
    if (index === activeProgressionIndex) return;
    if (isDirty) {
      setPendingProgressionIndex(index);
      setShowProgressionUnsavedDialog(true);
      return;
    }
    switchToProgression(index);
  };

  const handleProgressionReorder = async (
    newOrder: ProgressionItem[]
  ) => {
    if (!baseAnimationMeta) return;
    setProgressions(newOrder);
    try {
      const res = await fetch(
        `/api/animations/${baseAnimationMeta.id}/progressions/reorder`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: newOrder.map(p => ({ id: p.id, progression_order: p.progression_order })),
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Reorder failed');
      }
    } catch (err) {
      console.error('[Editor] Progression reorder failed:', err);
      toast.error('Failed to save new order');
      fetch(`/api/animations/${baseAnimationMeta.id}/progressions`)
        .then(r => r.ok ? r.json() : { progressions: [] })
        .then(({ progressions: progs }) => setProgressions(progs ?? []));
    }
  };

  const handleProgressionDiscardAndSwitch = () => {
    setShowProgressionUnsavedDialog(false);
    if (pendingProgressionIndex !== null) {
      switchToProgression(pendingProgressionIndex);
      setPendingProgressionIndex(null);
    }
  };

  const handleAddProgression = async () => {
    if (!cloudAnimationId || !baseAnimationMeta || isAddingProgression) return;
    const baseId = baseAnimationMeta.is_progression ? null : baseAnimationMeta.id;
    if (!baseId) { toast.error('Can only add progressions to base animations'); return; }
    if (progressions.length >= 5) { toast.error('Maximum 5 progressions reached'); return; }
    if (isDirty) {
      toast.error('Please save your changes before adding a progression');
      return;
    }

    setIsAddingProgression(true);
    try {
      const currentRes = await fetch(`/api/animations/${cloudAnimationId}`);
      if (!currentRes.ok) throw new Error('Failed to read current animation');
      const current = await currentRes.json();

      const newOrder = progressions.length + 1;
      const body = {
        title: `${baseAnimationMeta.title} — Progression ${newOrder}`,
        description: current.description ?? undefined,
        coaching_notes: current.coaching_notes ?? undefined,
        animation_type: current.animation_type,
        tags: current.tags ?? [],
        payload: current.payload,
        visibility: 'private' as const,
        parent_animation_id: baseId,
        is_progression: true,
        progression_order: newOrder,
      };

      const res = await fetch('/api/animations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Failed to create progression');
      }

      const newProg = await res.json();
      toast.success(`Progression ${newOrder} created`);

      const progRes = await fetch(`/api/animations/${baseId}/progressions`);
      if (progRes.ok) {
        const { progressions: progs } = await progRes.json();
        setProgressions(progs ?? []);
        const newIndex = (progs ?? []).findIndex((p: { id: string }) => p.id === newProg.id);
        if (newIndex >= 0) switchToProgression(newIndex);
      }
    } catch (err) {
      console.error('[Editor] Add progression failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add progression');
    } finally {
      setIsAddingProgression(false);
    }
  };

  return {
    baseAnimationMeta,
    setBaseAnimationMeta,
    progressions,
    setProgressions,
    activeProgressionIndex,
    setActiveProgressionIndex,
    showProgressionUnsavedDialog,
    setShowProgressionUnsavedDialog,
    pendingProgressionIndex,
    setPendingProgressionIndex,
    isAddingProgression,
    showProgressionPanel,
    handleProgressionSelectRequest,
    handleProgressionReorder,
    handleProgressionDiscardAndSwitch,
    handleAddProgression,
  };
}
