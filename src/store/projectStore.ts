import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    Project,
    ProjectSettingsUpdate,
    LoadResult,
    FrameUpdate,
    EntityCreate,
    EntityUpdate,
    AnnotationCreate,
    AnnotationUpdate,
    PlaybackSpeed,
    PlaybackPosition
} from '../types';

export interface ProjectStoreState {
    project: Project | null;
    currentFrameIndex: number;
    isPlaying: boolean;
    isDirty: boolean;
    playbackSpeed: PlaybackSpeed;
    loopPlayback: boolean;

    newProject: () => void;
    loadProject: (data: unknown) => LoadResult;
    saveProject: () => string;
    updateProjectSettings: (updates: Partial<ProjectSettingsUpdate>) => void;

    setCurrentFrame: (index: number) => void;
    addFrame: () => void;
    removeFrame: (frameId: string) => void;
    duplicateFrame: (frameId: string) => void;
    updateFrame: (frameId: string, updates: Partial<FrameUpdate>) => void;

    addEntity: (entity: EntityCreate) => string;
    updateEntity: (entityId: string, updates: Partial<EntityUpdate>) => void;
    removeEntity: (entityId: string) => void;
    removeEntityGlobally: (entityId: string) => void;
    propagateEntity: (entityId: string) => void;

    addAnnotation: (annotation: AnnotationCreate) => string;
    updateAnnotation: (annotationId: string, updates: Partial<AnnotationUpdate>) => void;
    removeAnnotation: (annotationId: string) => void;

    play: () => void;
    pause: () => void;
    reset: () => void;
    setPlaybackSpeed: (speed: PlaybackSpeed) => void;
    toggleLoop: () => void;

    setPlaybackPosition: (position: PlaybackPosition) => void;
}

export const useProjectStore = create<ProjectStoreState>()(
    devtools(
        (set) => ({
            project: null,
            currentFrameIndex: 0,
            isPlaying: false,
            isDirty: false,
            playbackSpeed: 1,
            loopPlayback: false,

            newProject: () => set(() => {
                const projectId = crypto.randomUUID();
                const frameId = crypto.randomUUID();
                const now = new Date().toISOString();

                const project: Project = {
                    version: '1.0',
                    id: projectId,
                    name: 'Untitled Play',
                    sport: 'rugby-union',
                    createdAt: now,
                    updatedAt: now,
                    frames: [
                        {
                            id: frameId,
                            index: 0,
                            duration: 2000,
                            entities: {},
                            annotations: [],
                        }
                    ],
                    settings: {
                        showGrid: true,
                        gridSpacing: 50,
                        defaultTransitionDuration: 2000,
                        exportResolution: '720p',
                    },
                };

                return {
                    project,
                    currentFrameIndex: 0,
                    isPlaying: false,
                    isDirty: false,
                    playbackSpeed: 1 as PlaybackSpeed,
                    loopPlayback: false,
                };
            }),
            loadProject: () => ({ success: true, errors: [], warnings: [] }),
            saveProject: () => '',
            updateProjectSettings: () => { },

            setCurrentFrame: () => { },
            addFrame: () => { },
            removeFrame: () => { },
            duplicateFrame: () => { },
            updateFrame: () => { },

            addEntity: () => '',
            updateEntity: () => { },
            removeEntity: () => { },
            removeEntityGlobally: () => { },
            propagateEntity: () => { },

            addAnnotation: () => '',
            updateAnnotation: () => { },
            removeAnnotation: () => { },

            play: () => { },
            pause: () => { },
            reset: () => { },
            setPlaybackSpeed: () => { },
            toggleLoop: () => { },

            setPlaybackPosition: () => { },
        }),
        { name: 'ProjectStore' }
    )
);
