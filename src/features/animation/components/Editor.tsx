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
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Menu, Grid, HelpCircle, Share2 } from 'lucide-react';
import Konva from 'konva';
import { Stage } from '@/features/animation/components/Canvas/Stage';
import { Field } from '@/features/animation/components/Canvas/Field';
import { FieldLayoutOverlay } from '@/features/animation/components/Canvas/FieldLayoutOverlay';
import { GridLayer } from '@/features/animation/components/Canvas/GridLayer';
import { EntityLayer } from '@/features/animation/components/Canvas/EntityLayer';
import { InlineEditor } from '@/features/animation/components/Canvas/InlineEditor';
import { GhostLayer } from '@/features/animation/components/Canvas/GhostLayer';
import { AnnotationLayer } from '@/features/animation/components/Canvas/AnnotationLayer';
import { AnnotationDrawingLayer } from '@/features/animation/components/Canvas/AnnotationDrawingLayer';
import { PitchLegend } from '@/features/animation/components/Canvas/PitchLegend';
import { EntityPalette } from '@/features/animation/components/Sidebar/EntityPalette';
import { EntityProperties } from '@/features/animation/components/Sidebar/EntityProperties';
import { ProjectActions } from '@/features/animation/components/Sidebar/ProjectActions';
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
import { TimelinePanel } from '@/features/animation/components/TimelinePanel';
import { ShareSheet } from '@/features/animation/components/ShareSheet';

import { Toaster } from 'sonner';
import { MobileDrawer } from './MobileDrawer';
import { EntityColors } from '@/features/animation/services/entityColors';
import Link from 'next/link';

interface EditorProps {
  isAuthenticated?: boolean;
  onSaveToCloud?: () => void;
  loadingFromCloud?: boolean;
  /** Cloud ID of the currently loaded animation (passed from AnimationToolClient) */
  cloudAnimationId?: string | null;
  /** Club strip colors from user profile (overrides default player colors) */
  stripColors?: { attack: string; defense: string };
  isEditMode?: boolean;
}

const SIDEBAR_STORAGE_KEY = 'coaching_animator_sidebar_collapsed';

export function Editor({ isAuthenticated = false, onSaveToCloud, loadingFromCloud = false, cloudAnimationId = null, stripColors, isEditMode = false }: EditorProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { width: canvasWidth, height: canvasHeight } = useEditorCanvasSize(canvasContainerRef);

  const stageRef = useRef<Konva.Stage>(null);
  const project = useProjectStore(s => s.project);
  const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);
  const isPlaying = useProjectStore(s => s.isPlaying);
  const playbackPosition = useProjectStore(s => s.playbackPosition);
  const isDirty = useProjectStore(s => s.isDirty);
  const newProject = useProjectStore(s => s.newProject);
  const updateEntity = useProjectStore(s => s.updateEntity);
  const setTeamColor = useProjectStore(s => s.setTeamColor);
  const rawTeamColors = useProjectStore(s => s.project?.settings?.teamColors);

  const selectedEntityId = useUIStore(s => s.selectedEntityId);
  const selectedAnnotationId = useUIStore(s => s.selectedAnnotationId);
  const selectAnnotation = useUIStore.getState().selectAnnotation;
  const drawingMode = useUIStore(s => s.drawingMode);
  const setDrawingMode = useUIStore.getState().setDrawingMode;
  const snapToGrid = useUIStore(s => s.snapToGrid);
  const toggleSnapToGrid = useUIStore.getState().toggleSnapToGrid;



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
    handleContextMenuBringForward,
    handleContextMenuSendBackward,
    contextMenuCanBringForward,
    contextMenuCanSendBackward,
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
  } = useEditorProgressionHandlers({ cloudAnimationId, isAuthenticated, isEditMode });

  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredProject, setRecoveredProject] = useState<unknown>(null);

  const teamColors = rawTeamColors ?? {
    attack: EntityColors.getDefault('player', 'attack'),
    defense: EntityColors.getDefault('player', 'defense'),
    other: EntityColors.getDefault('player', 'other'),
  };

  const {
    showGuestLimitModal,
    setShowGuestLimitModal,
    handleRecoverProject,
    handleSkipRecovery,
    handleAddAttackPlayer,
    handleAddDefensePlayer,
    handleAddOtherPlayer,
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
    handleDrawingComplete,
  } = useEditorPlaybackHandlers({
    isAuthenticated,
    setShowGuestLimitModal,
  });

  // Mobile editor state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('firstRunSeen') !== '1';
  });
  const isMobile = viewportWidth < 768;
  const showTimelinePanel = viewportWidth >= 1024;

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // Focus Mode state
  const [focusMode, setFocusMode] = useState(false);
  const focusModeSnapshot = useRef<{ sidebarCollapsed: boolean }>({ sidebarCollapsed: false });

  const enterFocusMode = useCallback(() => {
    focusModeSnapshot.current = { sidebarCollapsed };
    setSidebarCollapsed(true);
    setFocusMode(true);
  }, [sidebarCollapsed]);

  const exitFocusMode = useCallback(() => {
    setSidebarCollapsed(focusModeSnapshot.current.sidebarCollapsed);
    setFocusMode(false);
  }, []);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [pendingShareAfterSave, setPendingShareAfterSave] = useState(false);

  const handleShareClick = useCallback(() => {
    if (isDirty) {
      setPendingShareAfterSave(true);
      onSaveToCloud?.();
    } else {
      setIsShareOpen(true);
    }
  }, [isDirty, onSaveToCloud]);

  useEffect(() => {
    if (pendingShareAfterSave && !isDirty && cloudAnimationId) {
      setIsShareOpen(true);
      setPendingShareAfterSave(false);
    }
  }, [isDirty, cloudAnimationId, pendingShareAfterSave]);


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
    <div className="flex h-screen bg-[var(--color-surface-warm)] relative">
      <FirstRunModal 
        open={showOnboarding} 
        onDismiss={() => {
          try { localStorage.setItem('firstRunSeen', '1'); } catch {}
          setShowOnboarding(false);
        }} 
      />
      
      {/* Focus Mode Toggle Button */}
      <button
        onClick={focusMode ? exitFocusMode : enterFocusMode}
        className="fixed top-4 right-4 z-50 p-2 rounded-none bg-surface border border-border shadow-lg text-text-primary/70 hover:text-text-primary hover:scale-110 transition-all"
        aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
      >
        {focusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      {/* Snap to Grid Toggle Button */}
      {!focusMode && (
        <button
          onClick={toggleSnapToGrid}
                    className={`fixed top-4 right-16 z-50 p-2 rounded-none border transition-all ${
            snapToGrid 
              ? 'bg-tactics-white text-primary border-primary shadow-none' 
              : 'bg-black/80 text-white/70 border-white/10 hover:text-white'
          }`}
          aria-label={snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
          aria-pressed={snapToGrid}
        >
          <Grid className="w-5 h-5" />
        </button>
      )}

      {/* Share Button */}
      {!focusMode && (
        <button
          onClick={handleShareClick}
          disabled={!cloudAnimationId}
          className={`fixed top-4 right-28 z-50 p-2 rounded-none border transition-all bg-black/80 text-white/70 border-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Share Animation"
          title={!cloudAnimationId ? "Save animation to cloud first to share" : "Share Animation"}
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}

      {!focusMode && !isMobile && (
        <aside className={`border-r border-[var(--color-border)] bg-pitch-green flex flex-col transition-[width] duration-200 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
          <ErrorBoundary fallbackTitle="Sidebar Error">
            <div className="bg-tactics-white flex-1 overflow-y-auto relative">
              {!sidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 right-2 z-10 p-1.5 rounded-none bg-surface border border-border shadow-sm text-text-primary/50 hover:text-text-primary transition-all hover:scale-105"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <ProjectActions
                isAuthenticated={isAuthenticated}
                onSaveToCloud={onSaveToCloud}
                cloudAnimationId={cloudAnimationId}
              />
              <EntityPalette
                onAddAttackPlayer={handleAddAttackPlayer}
                onAddDefensePlayer={handleAddDefensePlayer}
                onAddOtherPlayer={handleAddOtherPlayer}
                onAddBall={handleAddBall}
                onAddCone={handleAddCone}
                onAddTackleShield={handleAddTackleShield}
                onAddTackleBag={handleAddTackleBag}
                teamColors={teamColors}
                onTeamColorChange={setTeamColor}
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
            {!sidebarCollapsed && (
              <div className="border-t border-border p-3 flex justify-between items-center bg-tactics-white">
                <button onClick={() => setShowOnboarding(true)} className="flex items-center gap-1.5 text-xs text-text-inverse/70 hover:text-text-inverse transition-colors" aria-label="Show guide">
                  <HelpCircle className="w-4 h-4" />
                  <span>How it works</span>
                </button>
                <Link href="/help" className="text-xs text-text-inverse/50 hover:text-text-inverse/80 transition-colors">Help</Link>
              </div>
            )}
          </ErrorBoundary>
        </aside>
      )}

      {sidebarCollapsed && !focusMode && !isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-surface border border-l-0 border-border p-1.5 rounded-none shadow-lg text-text-primary/50 hover:text-text-primary transition-all hover:pl-3 group"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      <main className="flex-1 flex flex-col">
        {/* Progression panel — shown for authenticated base animations (saved or new) */}
        {showProgressionPanel && !focusMode && (
          <ProgressionPanel
            baseTitle={baseAnimationMeta?.title ?? project?.name ?? 'This Animation'}
            progressions={progressions}
            activeIndex={activeProgressionIndex}
            onSelectRequest={handleProgressionSelectRequest}
            onAddProgression={handleAddProgression}
            onReorder={handleProgressionReorder}
            canAdd={!!cloudAnimationId && progressions.length < 5}
            addDisabledReason={!cloudAnimationId ? 'Save to cloud first to add progressions' : 'Maximum 5 progressions reached'}
            isAdding={isAddingProgression}
          />
        )}

        {/* Mobile drawer handle */}
        {isMobile && !focusMode && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-text-inverse px-6 py-3 rounded-none shadow-2xl flex items-center gap-2 font-semibold hover:scale-105 active:scale-95 transition-all"
            aria-label="Open mobile drawer"
          >
            <Menu className="w-5 h-5" />
            <span>Tools & Actions</span>
          </button>
        )}
        <div
          id="canvas-container"
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
            <div className="border border-[var(--color-accent-warm)] bg-surface shadow-lg">
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
                <GridLayer
                  width={canvasWidth}
                  height={canvasHeight}
                  visible={snapToGrid}
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
                  snapToGrid={snapToGrid}
                  stageWidth={canvasWidth}
                  stageHeight={canvasHeight}
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
      </main>

      {!focusMode && showTimelinePanel && <TimelinePanel />}

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
        onBringForward={handleContextMenuBringForward}
        onSendBackward={handleContextMenuSendBackward}
        canBringForward={contextMenuCanBringForward}
        canSendBackward={contextMenuCanSendBackward}
        onClose={() => setContextMenu(null)}
      />

      {annotationContextMenu && (
        <div
          className="absolute z-50 border border-[var(--color-border)] bg-surface shadow-lg"
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

      <ShareSheet
        animationId={cloudAnimationId || ''}
        animationTitle={baseAnimationMeta?.title || project?.name || 'Animation'}
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
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

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        onSaveToCloud={onSaveToCloud}
        onAddAttackPlayer={handleAddAttackPlayer}
        onAddDefensePlayer={handleAddDefensePlayer}
        onAddOtherPlayer={handleAddOtherPlayer}
        onAddBall={handleAddBall}
        onAddCone={handleAddCone}
        onAddTackleShield={handleAddTackleShield}
        onAddTackleBag={handleAddTackleBag}
        teamColors={teamColors}
        onTeamColorChange={setTeamColor}
        drawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
      />

    </div>
  );
}

export default Editor;
