import { useEffect, useState, useRef } from 'react';
import Konva from 'konva';
import { Stage } from './components/Canvas/Stage';
import { Field } from './components/Canvas/Field';
import { GridOverlay } from './components/Canvas/GridOverlay';
import { EntityLayer } from './components/Canvas/EntityLayer';
import { InlineEditor } from './components/Canvas/InlineEditor';
import { GhostLayer } from './components/Canvas/GhostLayer';
import { AnnotationLayer } from './components/Canvas/AnnotationLayer';
import { AnnotationDrawingLayer } from './components/Canvas/AnnotationDrawingLayer';
import { EntityPalette } from './components/Sidebar/EntityPalette';
import { EntityProperties } from './components/Sidebar/EntityProperties';
import { ProjectActions } from './components/Sidebar/ProjectActions';
import { FrameStrip, PlaybackControls } from './components/Timeline';
import { useAnimationLoop, useKeyboardShortcuts, useExport } from './hooks';
import { useAutoSave } from './hooks/useAutoSave';
import { useGifExportSpike } from './hooks/useGifExportSpike';
import { useProjectStore } from './store/projectStore';
import { useUIStore } from './store/uiStore';
import { DESIGN_TOKENS } from './constants/design-tokens';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { EntityContextMenu } from './components/ui/EntityContextMenu';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SportType } from './types';

import { ReplayPage } from './components/Replay/ReplayPage';

function Editor() {
    // Canvas dimensions
    const canvasWidth = 800;
    const canvasHeight = 600;

    // Stage ref for video export
    const stageRef = useRef<Konva.Stage>(null);

    // Get project store state and actions
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

    // Get UI store state and actions
    const { selectedEntityId, selectEntity, deselectAll, showGhosts, toggleGhosts, showGrid, toggleGrid, selectedAnnotationId, selectAnnotation, drawingMode, setDrawingMode } = useUIStore();

    // Initialize export hook
    const { exportStatus, exportProgress, exportError, startExport, canExport } = useExport(stageRef);

    // SPIKE: Initialize GIF export spike for testing
    const gifSpike = useGifExportSpike(stageRef);

    // Local state for crash recovery dialog
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
    const [recoveredProject, setRecoveredProject] = useState<unknown>(null);

    // Local state for inline editor
    const [inlineEditor, setInlineEditor] = useState<{
        entityId: string;
        position: { x: number; y: number };
        initialValue: string;
    } | null>(null);

    // Local state for context menu
    const [contextMenu, setContextMenu] = useState<{
        entityId: string;
        position: { x: number; y: number };
    } | null>(null);

    // Local state for annotation context menu
    const [annotationContextMenu, setAnnotationContextMenu] = useState<{
        annotationId: string;
        position: { x: number; y: number };
    } | null>(null);

    // Initialize hooks
    useAnimationLoop();
    useKeyboardShortcuts();
    useAutoSave();

    // Warn user before closing tab with unsaved changes (FR-PER-04)
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                // Modern browsers ignore the custom message and show a generic one
                event.preventDefault();
                // Chrome requires returnValue to be set
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    // Initialize project on mount and check for crash recovery
    useEffect(() => {
        if (!project) {
            // Check for auto-saved data
            const autosaveData = localStorage.getItem('rugby_animator_autosave');
            const autosaveTimestamp = localStorage.getItem('rugby_animator_autosave_timestamp');

            if (autosaveData && autosaveTimestamp) {
                try {
                    const data = JSON.parse(autosaveData);
                    const timestamp = new Date(autosaveTimestamp);
                    const now = new Date();
                    const minutesAgo = (now.getTime() - timestamp.getTime()) / (1000 * 60);

                    // Only offer recovery if autosave is less than 24 hours old
                    if (minutesAgo < 24 * 60) {
                        setRecoveredProject(data);
                        setShowRecoveryDialog(true);
                        return; // Don't create new project yet
                    }
                } catch (error) {
                    console.error('Failed to parse autosave data:', error);
                }
            }

            // No recovery data or recovery failed - create new project
            newProject();
        }
    }, [project, newProject]);

    // Handle crash recovery confirmation
    const handleRecoverProject = () => {
        if (recoveredProject) {
            const result = loadProject(recoveredProject);
            if (!result.success) {
                alert(`Failed to recover project:\n${result.errors.join('\n')}`);
                newProject();
            }
        }
        setShowRecoveryDialog(false);
        setRecoveredProject(null);
    };

    // Handle crash recovery cancellation
    const handleSkipRecovery = () => {
        setShowRecoveryDialog(false);
        setRecoveredProject(null);
        newProject();
    };

    // Entity palette handlers
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

    const handleAddMarker = () => {
        addEntity({
            type: 'marker',
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            team: 'neutral',
            color: DESIGN_TOKENS.colors.neutral[2],
            label: '',
        });
    };

    // Entity interaction handlers
    const handleEntitySelect = (entityId: string) => {
        selectEntity(entityId);
    };

    const handleEntityMove = (entityId: string, x: number, y: number) => {
        updateEntity(entityId, { x, y });
    };

    const handleEntityDoubleClick = (entityId: string) => {
        // Find the entity to get its current position for the editor
        const entity = entities.find(e => e.id === entityId);
        if (!entity || !stageRef.current) return;

        // Calculate screen position from canvas position
        // The canvas is centered in the viewport, so we need to account for that
        const canvasElement = stageRef.current.container();
        const rect = canvasElement.getBoundingClientRect();

        // Convert stage coordinates to absolute screen coordinates
        // stageRef.current.getAbsoluteTransform().point(entity) would be more robust 
        // if we had zooming/panning, but for now rect.left + entity.x is correct.
        const screenX = rect.left + entity.x;
        const screenY = rect.top + entity.y;

        setInlineEditor({
            entityId,
            position: { x: screenX - 40, y: screenY - 15 }, // Center the editor
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
                y: rect.top + event.y
            },
        });
    };

    // Inline editor handlers
    const handleInlineEditorConfirm = (value: string) => {
        if (inlineEditor) {
            updateEntity(inlineEditor.entityId, { label: value });
        }
        setInlineEditor(null);
    };

    const handleInlineEditorCancel = () => {
        setInlineEditor(null);
    };

    // Context menu handlers
    const handleContextMenuDuplicate = () => {
        if (!contextMenu || !project) return;
        const currentFrame = project.frames[currentFrameIndex];
        if (!currentFrame) return;

        const entity = currentFrame.entities[contextMenu.entityId];
        if (!entity) return;

        // Create a duplicate with offset position
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

    // Annotation context menu handlers
    const handleAnnotationContextMenu = (annotationId: string, event: { x: number; y: number }) => {
        if (!stageRef.current) return;

        const canvasElement = stageRef.current.container();
        const rect = canvasElement.getBoundingClientRect();

        setAnnotationContextMenu({
            annotationId,
            position: {
                x: rect.left + event.x,
                y: rect.top + event.y
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

    // Canvas click handler
    const handleCanvasClick = () => {
        deselectAll();
    };

    // Get current frame entities and annotations
    const currentFrame = project?.frames[currentFrameIndex];
    const entities = currentFrame ? Object.values(currentFrame.entities) : [];
    const annotations = currentFrame ? currentFrame.annotations : [];

    // Playback controls handlers
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

    // Sport change handler
    const handleSportChange = (sport: SportType) => {
        updateProjectSettings({ sport });
    };

    // Drawing completion handler
    const handleDrawingComplete = (points: number[], type: 'arrow' | 'line') => {
        addAnnotation({
            type,
            points,
            color: DESIGN_TOKENS.colors.annotation,
        });
        // Exit drawing mode after completing an annotation
        setDrawingMode('none');
    };

    return (
        <div className="flex h-screen bg-tactical-mono-50">
            {/* Left sidebar - Entity palette and Project actions */}
            <aside className="w-64 border-r border-tactical-mono-300 bg-pitch-green flex flex-col">
                <div className="p-4">
                    <h1 className="text-xl font-heading font-bold text-tactics-white mb-6">
                        Rugby Animation Tool
                    </h1>
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
                            onGifSpikeTest={gifSpike.exportAsGif}
                            gifSpikeInProgress={gifSpike.isExporting}
                        />
                        <EntityPalette
                            onAddAttackPlayer={handleAddAttackPlayer}
                            onAddDefensePlayer={handleAddDefensePlayer}
                            onAddBall={handleAddBall}
                            onAddCone={handleAddCone}
                            onAddMarker={handleAddMarker}
                            drawingMode={drawingMode}
                            onDrawingModeChange={setDrawingMode}
                        />
                        <EntityProperties
                            entity={selectedEntityId ? entities.find(e => e.id === selectedEntityId) || null : null}
                            onUpdate={(updates) => {
                                if (selectedEntityId) {
                                    updateEntity(selectedEntityId, updates);
                                }
                            }}
                        />
                    </div>
                </ErrorBoundary>
            </aside>

            {/* Center - Canvas and Timeline */}
            <main className="flex-1 flex flex-col">
                {/* Canvas area */}
                <div className="flex-1 flex items-center justify-center p-4 bg-tactical-mono-100">
                    <ErrorBoundary fallbackTitle="Canvas Error">
                        <div className="border border-tactical-mono-300 bg-white">
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
                                />
                                <GridOverlay
                                    width={canvasWidth}
                                    height={canvasHeight}
                                    visible={showGrid}
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
                                    frameIds={project?.frames.map(f => f.id) || []}
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

                {/* Timeline footer */}
                <ErrorBoundary fallbackTitle="Timeline Error">
                    <footer className="border-t border-tactical-mono-300">
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
                            onAddFrame={addFrame}
                            onRemoveFrame={removeFrame}
                            onDuplicateFrame={duplicateFrame}
                            onDurationChange={handleFrameDurationChange}
                        />
                    </footer>
                </ErrorBoundary>
            </main>

            {/* Crash recovery dialog */}
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

            {/* Inline editor */}
            {inlineEditor && (
                <InlineEditor
                    initialValue={inlineEditor.initialValue}
                    position={inlineEditor.position}
                    onConfirm={handleInlineEditorConfirm}
                    onCancel={handleInlineEditorCancel}
                />
            )}

            {/* Entity Context menu */}
            <EntityContextMenu
                position={contextMenu?.position || null}
                onDuplicate={handleContextMenuDuplicate}
                onDelete={handleContextMenuDelete}
                onEditLabel={handleContextMenuEditLabel}
                onClose={() => setContextMenu(null)}
            />

            {/* Annotation context menu */}
            {annotationContextMenu && (
                <div
                    className="absolute z-50 border border-tactical-mono-300 bg-white shadow-lg"
                    style={{
                        left: annotationContextMenu.position.x,
                        top: annotationContextMenu.position.y,
                    }}
                    onMouseLeave={() => setAnnotationContextMenu(null)}
                >
                    <button
                        className="block w-full px-4 py-2 text-left hover:bg-tactical-mono-100 text-sm"
                        onClick={handleAnnotationContextMenuDelete}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

function App() {
    // Simple routing based on pathname
    const path = window.location.pathname;

    // Check for /replay/:id
    if (path.startsWith('/replay/')) {
        const segments = path.split('/');
        const shareId = segments[segments.length - 1];

        if (shareId && shareId !== 'replay') {
            return <ReplayPage shareId={shareId} />;
        }
    }

    return <Editor />;
}

export default App;
