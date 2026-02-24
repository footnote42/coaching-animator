/**
 * Animation Editor - Main editor component for Next.js app
 *
 * This file is the SOLE editor implementation after the Vite → Next.js migration.
 * src/App.tsx (legacy Vite editor) was deleted during cleanup (2026-02-04).
 *
 * All entity creation handlers are defined here:
 * - handleAddCone() - Creates cone entities with default colors from EntityColors service
 * - handleAddBall() - Creates ball entities
 * - handleAddPlayer() - Creates player entities
 * - handleAddTackleShield() - Creates tackle shield entities
 * - handleAddTackleBag() - Creates tackle bag entities
 *
 * See specs/004-post-launch-improvements/ARCHITECTURE_CLEANUP_PLAN.md for cleanup history.
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import Konva from 'konva';
import { Stage } from '@/features/animation/components/Canvas/Stage';
import { Field } from '@/features/animation/components/Canvas/Field';
import { FieldLayoutOverlay } from '@/features/animation/components/Canvas/FieldLayoutOverlay';
import { EntityLayer } from '@/features/animation/components/Canvas/EntityLayer';
import { InlineEditor } from '@/features/animation/components/Canvas/InlineEditor';
import { GhostLayer } from '@/features/animation/components/Canvas/GhostLayer';
import { AnnotationLayer } from '@/features/animation/components/Canvas/AnnotationLayer';
import { AnnotationDrawingLayer } from '@/features/animation/components/Canvas/AnnotationDrawingLayer';
import { EntityPalette } from '@/features/animation/components/Sidebar/EntityPalette';
import { EntityProperties } from '@/features/animation/components/Sidebar/EntityProperties';
import { ProjectActions } from '@/features/animation/components/Sidebar/ProjectActions';
import { FrameStrip, PlaybackControls } from '@/features/animation/components/Timeline';
import { useAnimationLoop, useKeyboardShortcuts, useExport } from '@/core/hooks';
import { useAutoSave } from '@/core/hooks/useAutoSave';

import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { EntityColors } from '@/features/animation/services/entityColors';
import { VALIDATION } from '@/core/constants/validation';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EntityContextMenu } from '@/shared/ui/EntityContextMenu';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ProgressionPanel } from '@/features/animation/components/ProgressionPanel';
import { FirstRunModal } from '@/features/animation/components/FirstRunModal';

import { AnimationSummary } from '@/features/gallery/components/AnimationCard';
import { Toaster, toast } from 'sonner';

interface EditorProps {
  isAuthenticated?: boolean;
  onSaveToCloud?: () => void;
  loadingFromCloud?: boolean;
  /** Cloud ID of the currently loaded animation (passed from AnimationToolClient) */
  cloudAnimationId?: string | null;
  /** Club strip colors from user profile (overrides default player colors) */
  stripColors?: { attack: string; defense: string };
}

export function Editor({ isAuthenticated = false, onSaveToCloud, loadingFromCloud = false, cloudAnimationId = null, stripColors }: EditorProps) {
  const canvasWidth = 800;
  const canvasHeight = 600;

  const stageRef = useRef<Konva.Stage>(null);
  const {
    project,
    currentFrameIndex,
    isPlaying,
    playbackSpeed,
    loopPlayback,
    playbackPosition,
    isDirty,
    newProject,
    loadProject,
    addFrame,
    setCurrentFrame,
    removeFrame,
    duplicateFrame,
    addEntity,
    propagateEntity,
    updateEntity,
    play,
    pause,
    reset,
    setPlaybackSpeed,
    toggleLoop,
    updateFrame,
    addAnnotation,
  } = useProjectStore();

  const {
    selectedEntityId,
    selectEntity,
    deselectAll,
    showGhosts,
    toggleGhosts,
    selectedAnnotationId,
    selectAnnotation,
    drawingMode,
    setDrawingMode,
  } = useUIStore();

  const { exportStatus, exportProgress, exportError, startExport, canExport, recommendedFormat, formatReason } = useExport(stageRef);

  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredProject, setRecoveredProject] = useState<unknown>(null);

  // Phase 2: Progression panel state
  const [baseAnimationMeta, setBaseAnimationMeta] = useState<{ id: string; title: string; is_progression: boolean } | null>(null);
  const [progressions, setProgressions] = useState<Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>[]>([]);
  const [activeProgressionIndex, setActiveProgressionIndex] = useState<number>(-1); // -1 = base
  const [showProgressionUnsavedDialog, setShowProgressionUnsavedDialog] = useState(false);
  const [pendingProgressionIndex, setPendingProgressionIndex] = useState<number | null>(null);
  const [isAddingProgression, setIsAddingProgression] = useState(false);

  const [inlineEditor, setInlineEditor] = useState<{
    entityId: string;
    position: { x: number; y: number };
    initialValue: string;
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    entityId: string;
    position: { x: number; y: number };
  } | null>(null);

  const [annotationContextMenu, setAnnotationContextMenu] = useState<{
    annotationId: string;
    position: { x: number; y: number };
  } | null>(null);

  // Mobile editor warning state
  const [mobileWarningDismissed, setMobileWarningDismissed] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useAnimationLoop();
  useKeyboardShortcuts();
  useAutoSave();

  // Phase 2: Fetch base animation metadata + progressions when a cloud animation is loaded
  useEffect(() => {
    if (!cloudAnimationId || !isAuthenticated) {
      setBaseAnimationMeta(null);
      setProgressions([]);
      setActiveProgressionIndex(-1);
      return;
    }

    // Fetch animation metadata to determine if it's a base or a progression
    fetch(`/api/animations/${cloudAnimationId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setBaseAnimationMeta({
          id: data.id,
          title: data.title,
          is_progression: data.is_progression ?? false,
        });
        // Only fetch progressions for base animations (not for progressions themselves)
        if (!data.is_progression) {
          return fetch(`/api/animations/${cloudAnimationId}/progressions`)
            .then(res => res.ok ? res.json() : { progressions: [] })
            .then(({ progressions: progs }) => {
              setProgressions(progs ?? []);
              setActiveProgressionIndex(-1); // Base is active
            });
        }
      })
      .catch(err => console.error('[Editor] Failed to fetch progression metadata:', err));
  }, [cloudAnimationId, isAuthenticated]);

  // Track viewport width for mobile warning
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Autosave recovery - only if not loading from cloud URL
  useEffect(() => {
    if (!project && !loadingFromCloud) {
      const autosaveData = localStorage.getItem('rugby_animator_autosave');
      const autosaveTimestamp = localStorage.getItem('rugby_animator_autosave_timestamp');

      if (autosaveData && autosaveTimestamp) {
        try {
          const data = JSON.parse(autosaveData);
          const timestamp = new Date(autosaveTimestamp);
          const now = new Date();
          const minutesAgo = (now.getTime() - timestamp.getTime()) / (1000 * 60);

          if (minutesAgo < 24 * 60) {
            setRecoveredProject(data);
            setShowRecoveryDialog(true);
            return;
          }
        } catch (error) {
          console.error('Failed to parse autosave data:', error);
        }
      }
      newProject();
    }
  }, [project, newProject, loadingFromCloud]);

  const handleRecoverProject = () => {
    if (recoveredProject) {
      const result = loadProject(recoveredProject);
      if (!result.success) {
        toast.error(`Failed to recover project:\n${result.errors.join('\n')}`);
        newProject();
      }
    }
    setShowRecoveryDialog(false);
    setRecoveredProject(null);
  };

  const handleSkipRecovery = () => {
    setShowRecoveryDialog(false);
    setRecoveredProject(null);
    newProject();
  };

  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  const maxFrames = isAuthenticated
    ? VALIDATION.PROJECT.MAX_FRAMES
    : VALIDATION.PROJECT.GUEST_MAX_FRAMES;

  const handleAddFrame = () => {
    if (!project) return;
    if (project.frames.length >= maxFrames) {
      if (!isAuthenticated) {
        setShowGuestLimitModal(true);
      }
      return;
    }
    addFrame();
  };

  const addEntityWithPropagate = (entityData: Parameters<typeof addEntity>[0]) => {
    const newId = addEntity(entityData);
    if ((project?.frames.length ?? 0) > 1) {
      toast('Add entity to all subsequent frames?', {
        action: { label: 'Yes', onClick: () => propagateEntity(newId) },
        cancel: { label: 'No', onClick: () => {} },
      });
    }
  };

  const handleAddAttackPlayer = () => {
    addEntityWithPropagate({
      type: 'player',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'attack',
      color: stripColors?.attack || EntityColors.getDefault('player', 'attack'),
      label: '',
    });
  };

  const handleAddDefensePlayer = () => {
    addEntityWithPropagate({
      type: 'player',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'defense',
      color: stripColors?.defense || EntityColors.getDefault('player', 'defense'),
      label: '',
    });
  };

  const handleAddBall = () => {
    addEntityWithPropagate({
      type: 'ball',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('ball'),
      label: '',
    });
  };

  const handleAddCone = () => {
    addEntityWithPropagate({
      type: 'cone',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('cone'),
      label: '',
    });
  };

  const handleAddTackleShield = () => {
    addEntityWithPropagate({
      type: 'tackle-shield',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('tackle-shield'),
      label: '',
    });
  };

  const handleAddTackleBag = () => {
    addEntityWithPropagate({
      type: 'tackle-bag',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('tackle-bag'),
      label: '',
    });
  };

  const handleEntitySelect = (entityId: string) => {
    selectEntity(entityId);
  };

  const handleEntityMove = (entityId: string, x: number, y: number) => {
    updateEntity(entityId, { x, y });
  };

  const currentFrame = project?.frames[currentFrameIndex];
  const entities = currentFrame ? Object.values(currentFrame.entities) : [];
  const annotations = currentFrame ? currentFrame.annotations : [];

  const handleEntityDoubleClick = (entityId: string) => {
    const entity = entities.find((e) => e.id === entityId);
    if (!entity || !stageRef.current) return;

    const canvasElement = stageRef.current.container();
    const rect = canvasElement.getBoundingClientRect();

    const screenX = rect.left + entity.x;
    const screenY = rect.top + entity.y;

    setInlineEditor({
      entityId,
      position: { x: screenX - 40, y: screenY - 15 },
      initialValue: entity.label || '',
    });
  };

  const handleEntityContextMenu = (entityId: string, event: { x: number; y: number }) => {
    if (!stageRef.current) return;

    const canvasElement = stageRef.current.container();
    const rect = canvasElement.getBoundingClientRect();

    setContextMenu({
      entityId,
      position: {
        x: rect.left + event.x,
        y: rect.top + event.y,
      },
    });
  };

  const handleInlineEditorConfirm = (value: string) => {
    if (inlineEditor) {
      updateEntity(inlineEditor.entityId, { label: value });
    }
    setInlineEditor(null);
  };

  const handleInlineEditorCancel = () => {
    setInlineEditor(null);
  };

  const handleContextMenuDuplicate = () => {
    if (!contextMenu || !project) return;
    const frame = project.frames[currentFrameIndex];
    if (!frame) return;

    const entity = frame.entities[contextMenu.entityId];
    if (!entity) return;

    addEntity({
      type: entity.type,
      x: entity.x + 30,
      y: entity.y + 30,
      team: entity.team,
      color: entity.color,
      label: entity.label,
    });
  };

  const handleContextMenuDelete = () => {
    if (!contextMenu) return;
    const { removeEntity } = useProjectStore.getState();
    removeEntity(contextMenu.entityId);
    deselectAll();
  };

  const handleContextMenuEditLabel = () => {
    if (!contextMenu) return;
    handleEntityDoubleClick(contextMenu.entityId);
  };

  const handleAnnotationContextMenu = (annotationId: string, event: { x: number; y: number }) => {
    if (!stageRef.current) return;

    const canvasElement = stageRef.current.container();
    const rect = canvasElement.getBoundingClientRect();

    setAnnotationContextMenu({
      annotationId,
      position: {
        x: rect.left + event.x,
        y: rect.top + event.y,
      },
    });
  };

  const handleAnnotationContextMenuDelete = () => {
    if (!annotationContextMenu) return;
    const { removeAnnotation } = useProjectStore.getState();
    removeAnnotation(annotationContextMenu.annotationId);
    deselectAll();
    setAnnotationContextMenu(null);
  };

  const handleCanvasClick = () => {
    deselectAll();
  };

  const handlePreviousFrame = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrame(currentFrameIndex - 1);
    }
  };

  const handleNextFrame = () => {
    if (project && currentFrameIndex < project.frames.length - 1) {
      setCurrentFrame(currentFrameIndex + 1);
    }
  };

  const handleFrameDurationChange = (frameId: string, durationMs: number) => {
    updateFrame(frameId, { duration: durationMs });
  };

  const handleDrawingComplete = (points: number[], type: 'arrow' | 'line') => {
    addAnnotation({
      type,
      points,
      color: DESIGN_TOKENS.colours.annotation,
    });
    setDrawingMode('none');
  };

  // Phase 2: Progression handlers
  const handleProgressionSelectRequest = (index: number) => {
    if (index === activeProgressionIndex) return;
    if (isDirty) {
      setPendingProgressionIndex(index);
      setShowProgressionUnsavedDialog(true);
      return;
    }
    switchToProgression(index);
  };

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

  const handleProgressionReorder = async (
    newOrder: Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>[]
  ) => {
    if (!baseAnimationMeta) return;
    // Optimistic update
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
      // Revert: re-fetch from server
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
    const baseId = baseAnimationMeta.is_progression
      ? null // can't create progression of progression
      : baseAnimationMeta.id;
    if (!baseId) { toast.error('Can only add progressions to base animations'); return; }
    if (progressions.length >= 5) { toast.error('Maximum 5 progressions reached'); return; }
    if (isDirty) {
      toast.error('Please save your changes before adding a progression');
      return;
    }

    setIsAddingProgression(true);
    try {
      // Read current animation metadata for the payload
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

      // Refresh progressions list and switch to the new one
      const progRes = await fetch(`/api/animations/${baseId}/progressions`);
      if (progRes.ok) {
        const { progressions: progs } = await progRes.json();
        setProgressions(progs ?? []);
        // Switch to the newly created progression
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

  // Show progression panel only for authenticated users with a loaded cloud animation
  // that is a base animation (not a progression itself)
  const showProgressionPanel = isAuthenticated && cloudAnimationId && baseAnimationMeta && !baseAnimationMeta.is_progression;

  return (
    <div className="flex h-screen bg-[var(--color-surface-warm)]">
      <FirstRunModal />
      <aside className="w-64 border-r border-[var(--color-border)] bg-pitch-green flex flex-col">
        <ErrorBoundary fallbackTitle="Sidebar Error">
          <div className="bg-tactics-white flex-1 overflow-y-auto">
            <ProjectActions
              onExport={startExport}
              exportStatus={exportStatus}
              exportProgress={exportProgress}
              exportError={exportError}
              canExport={canExport}
              isAuthenticated={isAuthenticated}
              onSaveToCloud={onSaveToCloud}
              recommendedFormat={recommendedFormat}
              formatReason={formatReason}
            />
            <EntityPalette
              onAddAttackPlayer={handleAddAttackPlayer}
              onAddDefensePlayer={handleAddDefensePlayer}
              onAddBall={handleAddBall}
              onAddCone={handleAddCone}
              onAddTackleShield={handleAddTackleShield}
              onAddTackleBag={handleAddTackleBag}
              drawingMode={drawingMode}
              onDrawingModeChange={setDrawingMode}
            />
            <EntityProperties
              entity={selectedEntityId ? entities.find((e) => e.id === selectedEntityId) || null : null}
              onUpdate={(updates) => {
                if (selectedEntityId) {
                  updateEntity(selectedEntityId, updates);
                }
              }}
            />
          </div>
        </ErrorBoundary>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* Phase 2: Progression panel — shown for base cloud animations */}
        {showProgressionPanel && (
          <ProgressionPanel
            baseTitle={baseAnimationMeta!.title}
            progressions={progressions}
            activeIndex={activeProgressionIndex}
            onSelectRequest={handleProgressionSelectRequest}
            onAddProgression={handleAddProgression}
            onReorder={handleProgressionReorder}
            canAdd={progressions.length < 5}
            isAdding={isAddingProgression}
          />
        )}

        {/* Mobile editor warning */}
        {viewportWidth < 768 && !mobileWarningDismissed && (
          <div className="px-4 py-2 bg-[var(--color-accent-warm)]/10 border-b border-[var(--color-accent-warm)] text-sm text-text-primary flex items-center justify-between gap-3">
            <span>💻 Desktop recommended for editing. Mobile editing may be limited.</span>
            <button
              onClick={() => setMobileWarningDismissed(true)}
              className="text-text-primary/70 hover:text-text-primary px-2 py-1"
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}
        <div
          className="flex-1 flex items-center justify-center p-4 bg-[var(--color-surface-warm)]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0, 0, 0, 0.02) 10px,
              rgba(0, 0, 0, 0.02) 20px
            )`
          }}
        >
          <ErrorBoundary fallbackTitle="Canvas Error">
            <div className="border border-[var(--color-accent-warm)] bg-white shadow-lg">
              <Stage
                ref={stageRef}
                width={canvasWidth}
                height={canvasHeight}
                onCanvasClick={handleCanvasClick}
              >
                <Field
                  sport={project?.sport || 'rugby-union'}
                  width={canvasWidth}
                  height={canvasHeight}
                  layout={project?.settings.pitchLayout}
                />
                <FieldLayoutOverlay
                  layout={project?.settings.pitchLayout || 'standard'}
                  sport={project?.sport || 'rugby-union'}
                  width={canvasWidth}
                  height={canvasHeight}
                />
                <GhostLayer />
                <EntityLayer
                  entities={entities}
                  selectedEntityId={selectedEntityId}
                  onEntitySelect={handleEntitySelect}
                  onEntityMove={handleEntityMove}
                  onEntityDoubleClick={handleEntityDoubleClick}
                  onEntityContextMenu={handleEntityContextMenu}
                  interactive={!isPlaying}
                  playbackPosition={playbackPosition}
                  frames={project?.frames ?? []}
                />
                <AnnotationLayer
                  annotations={annotations}
                  selectedAnnotationId={selectedAnnotationId}
                  onAnnotationSelect={selectAnnotation}
                  onContextMenu={handleAnnotationContextMenu}
                  interactive={!isPlaying}
                  currentFrameId={currentFrame?.id || ''}
                  frameIds={project?.frames.map((f) => f.id) || []}
                />
                <AnnotationDrawingLayer
                  drawingMode={drawingMode}
                  defaultColor={DESIGN_TOKENS.colours.annotation}
                  onDrawingComplete={handleDrawingComplete}
                  interactive={!isPlaying}
                  width={canvasWidth}
                  height={canvasHeight}
                />
              </Stage>
            </div>
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallbackTitle="Timeline Error">
          <footer className="border-t border-[var(--color-accent-warm)]">
            <PlaybackControls
              isPlaying={isPlaying}
              speed={playbackSpeed}
              loopEnabled={loopPlayback}
              currentFrame={currentFrameIndex}
              totalFrames={project?.frames.length ?? 0}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onPreviousFrame={handlePreviousFrame}
              onNextFrame={handleNextFrame}
              onSpeedChange={setPlaybackSpeed}
              onLoopToggle={toggleLoop}
              ghostEnabled={showGhosts}
              onGhostToggle={toggleGhosts}
            />
            <FrameStrip
              frames={project?.frames ?? []}
              currentFrameIndex={currentFrameIndex}
              onFrameSelect={setCurrentFrame}
              onAddFrame={handleAddFrame}
              onRemoveFrame={removeFrame}
              onDuplicateFrame={duplicateFrame}
              onDurationChange={handleFrameDurationChange}
              maxFrames={maxFrames}
              isAuthenticated={isAuthenticated}
              onShowGuestLimitModal={() => setShowGuestLimitModal(true)}
            />
          </footer>
        </ErrorBoundary>
      </main>

      <ConfirmDialog
        open={showRecoveryDialog}
        onConfirm={handleRecoverProject}
        onCancel={handleSkipRecovery}
        title="Recover Auto-Saved Project"
        description="An auto-saved project was found. Would you like to recover it?"
        confirmLabel="Recover"
        cancelLabel="Start Fresh"
        variant="default"
      />

      {inlineEditor && (
        <InlineEditor
          initialValue={inlineEditor.initialValue}
          position={inlineEditor.position}
          onConfirm={handleInlineEditorConfirm}
          onCancel={handleInlineEditorCancel}
        />
      )}

      <EntityContextMenu
        position={contextMenu?.position || null}
        onDuplicate={handleContextMenuDuplicate}
        onDelete={handleContextMenuDelete}
        onEditLabel={handleContextMenuEditLabel}
        onClose={() => setContextMenu(null)}
      />

      {annotationContextMenu && (
        <div
          className="absolute z-50 border border-[var(--color-border)] bg-white shadow-lg"
          style={{
            left: annotationContextMenu.position.x,
            top: annotationContextMenu.position.y,
          }}
          onMouseLeave={() => setAnnotationContextMenu(null)}
        >
          <button
            className="block w-full px-4 py-2 text-left hover:bg-[var(--color-surface-warm)] text-sm"
            onClick={handleAnnotationContextMenuDelete}
          >
            Delete
          </button>
        </div>
      )}

      {/* Phase 2: Unsaved changes guard for progression switching */}
      <ConfirmDialog
        open={showProgressionUnsavedDialog}
        onConfirm={handleProgressionDiscardAndSwitch}
        onCancel={() => { setShowProgressionUnsavedDialog(false); setPendingProgressionIndex(null); }}
        title="Unsaved Changes"
        description="Switching progressions will discard your current changes. Discard and switch?"
        confirmLabel="Discard & Switch"
        cancelLabel="Cancel"
        variant="destructive"
      />

      <Toaster position="bottom-right" />

      {/* Guest Frame Limit Modal */}
      <ConfirmDialog
        open={showGuestLimitModal}
        onConfirm={() => {
          setShowGuestLimitModal(false);
          window.location.href = '/register?redirect=/app';
        }}
        onCancel={() => setShowGuestLimitModal(false)}
        title="Frame Limit Reached"
        description={`Guest users can create up to ${VALIDATION.PROJECT.GUEST_MAX_FRAMES} frames. Create a free account to unlock up to ${VALIDATION.PROJECT.MAX_FRAMES} frames and save your animations to the cloud.`}
        confirmLabel="Create Free Account"
        cancelLabel="Continue Editing"
        variant="default"
      />
    </div>
  );
}

export default Editor;
