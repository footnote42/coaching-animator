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
import { PitchLegend } from '@/features/animation/components/Canvas/PitchLegend';
import { EntityPalette } from '@/features/animation/components/Sidebar/EntityPalette';
import { EntityProperties } from '@/features/animation/components/Sidebar/EntityProperties';
import { ProjectActions } from '@/features/animation/components/Sidebar/ProjectActions';
import { FrameStrip, PlaybackControls } from '@/features/animation/components/Timeline';
import { useAnimationLoop, useKeyboardShortcuts } from '@/core/hooks';
import { useAutoSave } from '@/core/hooks/useAutoSave';
import { useEditorCanvasSize } from '@/core/hooks/useEditorCanvasSize';

import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import { useEditorContextMenuHandlers } from '@/features/animation/components/hooks/useEditorContextMenuHandlers';
import { useEditorProgressionHandlers } from '@/features/animation/components/hooks/useEditorProgressionHandlers';
import { useEditorEntityHandlers } from '@/features/animation/components/hooks/useEditorEntityHandlers';
import { useEditorPlaybackHandlers } from '@/features/animation/components/hooks/useEditorPlaybackHandlers';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { VALIDATION } from '@/core/constants/validation';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EntityContextMenu } from '@/shared/ui/EntityContextMenu';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ProgressionPanel } from '@/features/animation/components/ProgressionPanel';
import { FirstRunModal } from '@/features/animation/components/FirstRunModal';

import { Toaster } from 'sonner';

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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { width: canvasWidth, height: canvasHeight } = useEditorCanvasSize(canvasContainerRef);

  const stageRef = useRef<Konva.Stage>(null);
  const project = useProjectStore(s => s.project);
  const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);
  const isPlaying = useProjectStore(s => s.isPlaying);
  const playbackSpeed = useProjectStore(s => s.playbackSpeed);
  const loopPlayback = useProjectStore(s => s.loopPlayback);
  const playbackPosition = useProjectStore(s => s.playbackPosition);
  const isDirty = useProjectStore(s => s.isDirty);
  const newProject = useProjectStore(s => s.newProject);
  const removeFrame = useProjectStore.getState().removeFrame;
  const duplicateFrame = useProjectStore.getState().duplicateFrame;
  const updateEntity = useProjectStore(s => s.updateEntity);
  const play = useProjectStore.getState().play;
  const pause = useProjectStore.getState().pause;
  const reset = useProjectStore.getState().reset;
  const setPlaybackSpeed = useProjectStore.getState().setPlaybackSpeed;
  const toggleLoop = useProjectStore.getState().toggleLoop;
  const setCurrentFrame = useProjectStore.getState().setCurrentFrame;

  const selectedEntityId = useUIStore(s => s.selectedEntityId);
  const showGhosts = useUIStore(s => s.showGhosts);
  const toggleGhosts = useUIStore.getState().toggleGhosts;
  const selectedAnnotationId = useUIStore(s => s.selectedAnnotationId);
  const selectAnnotation = useUIStore.getState().selectAnnotation;
  const drawingMode = useUIStore(s => s.drawingMode);
  const setDrawingMode = useUIStore(s => s.setDrawingMode);



  const {
    inlineEditor,
    contextMenu,
    setContextMenu,
    annotationContextMenu,
    setAnnotationContextMenu,
    handleEntitySelect,
    handleEntityMove,
    handleEntityDoubleClick,
    handleEntityContextMenu,
    handleInlineEditorConfirm,
    handleInlineEditorCancel,
    handleContextMenuDuplicate,
    handleContextMenuDelete,
    handleContextMenuEditLabel,
    handleAnnotationContextMenu,
    handleAnnotationContextMenuDelete,
    handleCanvasClick,
  } = useEditorContextMenuHandlers({ project, currentFrameIndex, stageRef });

  const {
    baseAnimationMeta,
    setBaseAnimationMeta,
    progressions,
    setProgressions,
    activeProgressionIndex,
    setActiveProgressionIndex,
    showProgressionUnsavedDialog,
    setShowProgressionUnsavedDialog,
    setPendingProgressionIndex,
    isAddingProgression,
    showProgressionPanel,
    handleProgressionSelectRequest,
    handleProgressionReorder,
    handleProgressionDiscardAndSwitch,
    handleAddProgression,
  } = useEditorProgressionHandlers({ cloudAnimationId, isAuthenticated });

  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredProject, setRecoveredProject] = useState<unknown>(null);

  const {
    showGuestLimitModal,
    setShowGuestLimitModal,
    handleRecoverProject,
    handleSkipRecovery,
    handleAddAttackPlayer,
    handleAddDefensePlayer,
    handleAddBall,
    handleAddCone,
    handleAddTackleShield,
    handleAddTackleBag,
  } = useEditorEntityHandlers({
    setShowRecoveryDialog,
    recoveredProject,
    setRecoveredProject,
    stripColors,
    canvasWidth,
    canvasHeight,
  });

  const {
    handleAddFrame,
    handlePreviousFrame,
    handleNextFrame,
    handleFrameDurationChange,
    handleDrawingComplete,
  } = useEditorPlaybackHandlers({
    isAuthenticated,
    setShowGuestLimitModal,
  });

  const maxFrames = isAuthenticated
    ? VALIDATION.PROJECT.MAX_FRAMES
    : VALIDATION.PROJECT.GUEST_MAX_FRAMES;

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
  }, [cloudAnimationId, isAuthenticated, setBaseAnimationMeta, setProgressions, setActiveProgressionIndex]);

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

  const currentFrame = project?.frames[currentFrameIndex];
  const entities = currentFrame ? Object.values(currentFrame.entities) : [];
  const annotations = currentFrame ? currentFrame.annotations : [];

  return (
    <div className="flex h-screen bg-[var(--color-surface-warm)]">
      <FirstRunModal />
      <aside className="w-64 border-r border-[var(--color-border)] bg-pitch-green flex flex-col">
        <ErrorBoundary fallbackTitle="Sidebar Error">
          <div className="bg-tactics-white flex-1 overflow-y-auto">
            <ProjectActions
              isAuthenticated={isAuthenticated}
              onSaveToCloud={onSaveToCloud}
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
          ref={canvasContainerRef}
          className="flex-1 min-h-0 min-w-0 overflow-hidden flex items-center justify-center p-4 bg-[var(--color-surface-warm)]"
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
                <PitchLegend height={canvasHeight} />
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
