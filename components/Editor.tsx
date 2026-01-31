'use client';

import { useEffect, useState, useRef } from 'react';
import Konva from 'konva';
import { Stage } from '@/components/Canvas/Stage';
import { Field } from '@/components/Canvas/Field';
import { FieldLayoutOverlay } from '@/components/Canvas/FieldLayoutOverlay';
import { GridOverlay } from '@/components/Canvas/GridOverlay';
import { EntityLayer } from '@/components/Canvas/EntityLayer';
import { InlineEditor } from '@/components/Canvas/InlineEditor';
import { GhostLayer } from '@/components/Canvas/GhostLayer';
import { AnnotationLayer } from '@/components/Canvas/AnnotationLayer';
import { AnnotationDrawingLayer } from '@/components/Canvas/AnnotationDrawingLayer';
import { EntityPalette } from '@/components/Sidebar/EntityPalette';
import { EntityProperties } from '@/components/Sidebar/EntityProperties';
import { ProjectActions } from '@/components/Sidebar/ProjectActions';
import { FrameStrip, PlaybackControls } from '@/components/Timeline';
import { useAnimationLoop, useKeyboardShortcuts, useExport } from '@/hooks';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { DESIGN_TOKENS } from '@/constants/design-tokens';
import { VALIDATION } from '@/constants/validation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityContextMenu } from '@/components/ui/EntityContextMenu';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SportType } from '@/types';
import { Toaster, toast } from 'sonner';

interface EditorProps {
  isAuthenticated?: boolean;
  onSaveToCloud?: () => void;
  loadingFromCloud?: boolean;
}

export function Editor({ isAuthenticated = false, onSaveToCloud, loadingFromCloud = false }: EditorProps) {
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
    updateEntity,
    play,
    pause,
    reset,
    setPlaybackSpeed,
    toggleLoop,
    updateFrame,
    updateProjectSettings,
    addAnnotation,
  } = useProjectStore();

  const {
    selectedEntityId,
    selectEntity,
    deselectAll,
    showGhosts,
    toggleGhosts,
    showGrid,
    toggleGrid,
    selectedAnnotationId,
    selectAnnotation,
    drawingMode,
    setDrawingMode,
  } = useUIStore();

  const { exportStatus, exportProgress, exportError, startExport, canExport, recommendedFormat, formatReason } = useExport(stageRef);

  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredProject, setRecoveredProject] = useState<unknown>(null);

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

  useAnimationLoop();
  useKeyboardShortcuts();
  useAutoSave();

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

  const handleAddAttackPlayer = () => {
    addEntity({
      type: 'player',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'attack',
      color: DESIGN_TOKENS.colors.attack[0],
      label: '',
    });
  };

  const handleAddDefensePlayer = () => {
    addEntity({
      type: 'player',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'defense',
      color: DESIGN_TOKENS.colors.defense[0],
      label: '',
    });
  };

  const handleAddBall = () => {
    addEntity({
      type: 'ball',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: DESIGN_TOKENS.colors.neutral[0],
      label: '',
    });
  };

  const handleAddCone = () => {
    addEntity({
      type: 'cone',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: DESIGN_TOKENS.colors.neutral[1],
      label: '',
    });
  };

  const handleAddTackleShield = () => {
    addEntity({
      type: 'tackle-shield',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: '#1E40AF',
      label: '',
    });
  };

  const handleAddTackleBag = () => {
    addEntity({
      type: 'tackle-bag',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: '#7C3AED',
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

  const handleSportChange = (sport: SportType) => {
    updateProjectSettings({ sport });
  };

  const handleDrawingComplete = (points: number[], type: 'arrow' | 'line') => {
    addAnnotation({
      type,
      points,
      color: DESIGN_TOKENS.colors.annotation,
    });
    setDrawingMode('none');
  };

  return (
    <div className="flex h-screen bg-[var(--color-surface-warm)]">
      <aside className="w-64 border-r border-[var(--color-border)] bg-pitch-green flex flex-col">
        <div className="p-4">
          <a href="/" className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity">
            <span className="text-lg">🏉</span>
            <span className="text-sm font-medium text-tactics-white">Coaching Animator</span>
          </a>
          <h1 className="text-xl font-heading font-bold text-tactics-white mb-4">
            Animation Editor
          </h1>
          <div className="flex flex-wrap gap-2 text-xs">
            <a href="/gallery" className="text-tactics-white/70 hover:text-tactics-white transition-colors">
              Gallery
            </a>
            {isAuthenticated && (
              <>
                <span className="text-tactics-white/40">•</span>
                <a href="/my-gallery" className="text-tactics-white/70 hover:text-tactics-white transition-colors">
                  My Playbook
                </a>
              </>
            )}
          </div>
        </div>

        <ErrorBoundary fallbackTitle="Sidebar Error">
          <div className="bg-tactics-white flex-1 overflow-y-auto">
            <ProjectActions
              currentSport={project?.sport || 'rugby-union'}
              onSportChange={handleSportChange}
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
                <GridOverlay width={canvasWidth} height={canvasHeight} visible={showGrid} />
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
                  defaultColor={DESIGN_TOKENS.colors.annotation}
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
              gridEnabled={showGrid}
              onGridToggle={toggleGrid}
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
