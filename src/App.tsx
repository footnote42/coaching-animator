import { useEffect } from 'react';
import { Stage } from './components/Canvas/Stage';
import { Field } from './components/Canvas/Field';
import { EntityLayer } from './components/Canvas/EntityLayer';
import { EntityPalette } from './components/Sidebar/EntityPalette';
import { FrameStrip, PlaybackControls } from './components/Timeline';
import { useAnimationLoop, useKeyboardShortcuts } from './hooks';
import { useProjectStore } from './store/projectStore';
import { useUIStore } from './store/uiStore';
import { DESIGN_TOKENS } from './constants/design-tokens';

function App() {
    // Canvas dimensions
    const canvasWidth = 800;
    const canvasHeight = 600;

    // Get project store state and actions
    const {
        project,
        currentFrameIndex,
        isPlaying,
        playbackSpeed,
        loopPlayback,
        newProject,
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
    } = useProjectStore();

    // Get UI store state and actions
    const { selectedEntityId, selectEntity, deselectAll } = useUIStore();

    // Initialize hooks
    useAnimationLoop();
    useKeyboardShortcuts();

    // Initialize project on mount if not already created
    useEffect(() => {
        if (!project) {
            newProject();
        }
    }, [project, newProject]);

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
        console.log('Entity double-clicked:', entityId);
        // TODO: Implement label editing in future phase
    };

    const handleEntityContextMenu = (entityId: string, event: { x: number; y: number }) => {
        console.log('Entity context menu:', entityId, event);
        // TODO: Implement context menu in future phase
    };

    // Canvas click handler
    const handleCanvasClick = () => {
        deselectAll();
    };

    // Get current frame entities
    const currentFrame = project?.frames[currentFrameIndex];
    const entities = currentFrame ? Object.values(currentFrame.entities) : [];

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

    return (
        <div className="flex h-screen bg-tactical-mono-50">
            {/* Left sidebar - Entity palette */}
            <aside className="w-64 border-r border-tactical-mono-300 bg-pitch-green p-4">
                <h1 className="text-xl font-heading font-bold text-tactics-white mb-6">
                    Rugby Animation Tool
                </h1>
                <EntityPalette
                    onAddAttackPlayer={handleAddAttackPlayer}
                    onAddDefensePlayer={handleAddDefensePlayer}
                    onAddBall={handleAddBall}
                    onAddCone={handleAddCone}
                    onAddMarker={handleAddMarker}
                />
            </aside>

            {/* Center - Canvas and Timeline */}
            <main className="flex-1 flex flex-col">
                {/* Canvas area */}
                <div className="flex-1 flex items-center justify-center p-4 bg-tactical-mono-100">
                    <div className="border border-tactical-mono-300 bg-white">
                        <Stage
                            width={canvasWidth}
                            height={canvasHeight}
                            onCanvasClick={handleCanvasClick}
                        >
                            <Field
                                sport="rugby-union"
                                width={canvasWidth}
                                height={canvasHeight}
                            />
                            <EntityLayer
                                entities={entities}
                                selectedEntityId={selectedEntityId}
                                onEntitySelect={handleEntitySelect}
                                onEntityMove={handleEntityMove}
                                onEntityDoubleClick={handleEntityDoubleClick}
                                onEntityContextMenu={handleEntityContextMenu}
                                interactive={!isPlaying}
                            />
                        </Stage>
                    </div>
                </div>

                {/* Timeline footer */}
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
                    />

                    <FrameStrip
                        frames={project?.frames ?? []}
                        currentFrameIndex={currentFrameIndex}
                        onFrameSelect={setCurrentFrame}
                        onAddFrame={addFrame}
                        onRemoveFrame={removeFrame}
                        onDuplicateFrame={duplicateFrame}
                    />
                </footer>
            </main>
        </div>
    );
}

export default App;
