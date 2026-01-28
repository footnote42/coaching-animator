import { useEffect, useRef } from 'react';
import { Stage } from '../Canvas/Stage';
import { Field } from '../Canvas/Field';
import { EntityLayer } from '../Canvas/EntityLayer';
import { GhostLayer } from '../Canvas/GhostLayer';
import { AnnotationLayer } from '../Canvas/AnnotationLayer';
import { PlaybackControls, FrameStrip } from '../Timeline';
import { useProjectStore } from '../../store/projectStore';
import { useSharePayload } from '../../hooks/useSharePayload';
import { useAnimationLoop } from '../../hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ReplayPageProps {
    shareId: string;
}

export const ReplayPage: React.FC<ReplayPageProps> = ({ shareId }) => {
    const stageRef = useRef<any>(null);
    const { payload, isLoading: isFetching, error } = useSharePayload(shareId);

    const {
        project,
        currentFrameIndex,
        isPlaying,
        playbackSpeed,
        loopPlayback,
        playbackPosition,
        loadFromSharePayload,
        play,
        pause,
        reset,
        setCurrentFrame,
        setPlaybackSpeed,
        toggleLoop
    } = useProjectStore();

    // Use animation loop for playback
    useAnimationLoop();

    // Load payload into store when fetched
    useEffect(() => {
        if (payload) {
            loadFromSharePayload(payload);
            play(); // Auto-play
        }
    }, [payload, loadFromSharePayload, play]);

    if (isFetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-tactical-mono-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-pitch-green mb-4" />
                    <p className="text-tactical-mono-600">Loading animation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-tactical-mono-50">
                <div className="max-w-md p-6 bg-white rounded-none shadow-md border border-red-200 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Replay</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => window.location.href = '/'} variant="default">
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    // Derived state
    const currentFrame = project?.frames[currentFrameIndex];
    const entities = currentFrame ? Object.values(currentFrame.entities) : [];
    const annotations = currentFrame ? currentFrame.annotations : [];
    const canvasWidth = 800;
    const canvasHeight = 600;

    return (
        <div className="flex flex-col h-screen bg-tactical-mono-50 items-center justify-center">
            {/* Header / Meta */}
            <div className="absolute top-4 left-4 z-10">
                <Button onClick={() => window.location.href = '/'} variant="outline" size="sm">
                    Create Your Own
                </Button>
            </div>

            {/* Canvas */}
            <div className="border border-tactical-mono-300 bg-white shadow-lg rounded-none overflow-hidden">
                <Stage
                    ref={stageRef}
                    width={canvasWidth}
                    height={canvasHeight}
                >
                    <Field
                        sport={project?.sport || 'rugby-union'}
                        width={canvasWidth}
                        height={canvasHeight}
                    />
                    <GhostLayer />
                    <EntityLayer
                        entities={entities}
                        selectedEntityId={null} // Read-only
                        onEntitySelect={() => { }}
                        onEntityMove={() => { }}
                        onEntityDoubleClick={() => { }}
                        onEntityContextMenu={() => { }}
                        interactive={false}
                        playbackPosition={playbackPosition}
                        frames={project?.frames ?? []}
                    />
                    <AnnotationLayer
                        annotations={annotations}
                        selectedAnnotationId={null}
                        onAnnotationSelect={() => { }}
                        onContextMenu={() => { }}
                        interactive={false}
                        currentFrameId={currentFrame?.id || ''}
                        frameIds={project?.frames.map(f => f.id) || []}
                    />
                </Stage>
            </div>

            {/* Controls */}
            <div className="mt-6 w-[800px] bg-white rounded-none shadow border border-tactical-mono-200 p-2">
                <PlaybackControls
                    isPlaying={isPlaying}
                    speed={playbackSpeed}
                    loopEnabled={loopPlayback}
                    currentFrame={currentFrameIndex}
                    totalFrames={project?.frames.length ?? 0}
                    onPlay={play}
                    onPause={pause}
                    onReset={reset}
                    onPreviousFrame={() => setCurrentFrame(Math.max(0, currentFrameIndex - 1))}
                    onNextFrame={() => setCurrentFrame(Math.min((project?.frames.length || 1) - 1, currentFrameIndex + 1))}
                    onSpeedChange={setPlaybackSpeed}
                    onLoopToggle={toggleLoop}
                    ghostEnabled={false}
                    onGhostToggle={() => { }}
                    gridEnabled={false}
                    onGridToggle={() => { }}
                />
            </div>

            {/* Frame Strip */}
            <div className="mt-2 w-[800px]">
                <FrameStrip
                    frames={project?.frames ?? []}
                    currentFrameIndex={currentFrameIndex}
                    onFrameSelect={setCurrentFrame}
                    onAddFrame={() => { }} // Disabled
                    onRemoveFrame={() => { }} // Disabled
                    onDuplicateFrame={() => { }} // Disabled
                    onDurationChange={() => { }} // Disabled
                />
            </div>
        </div>
    );
};
