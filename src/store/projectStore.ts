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
    PlaybackPosition,
    Entity
} from '../types';
import { DESIGN_TOKENS } from '../constants/design-tokens';
import { VALIDATION } from '../constants/validation';
import { validateHexColor, validateEntityLabel } from '../utils/validation';

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

            setCurrentFrame: (index: number) => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Guard: Return if index is out of bounds
                if (index < 0 || index >= state.project.frames.length) {
                    return state;
                }

                // Stop playback if playing
                return {
                    ...state,
                    currentFrameIndex: index,
                    isPlaying: false,
                };
            }),

            addFrame: () => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Get current frame
                const currentFrame = state.project.frames[state.currentFrameIndex];

                // Create new frame with copied entities
                const newFrameId = crypto.randomUUID();
                const newFrame = {
                    id: newFrameId,
                    index: state.currentFrameIndex + 1,
                    duration: state.project.settings.defaultTransitionDuration,
                    entities: { ...currentFrame.entities },
                    annotations: [],
                };

                // Insert new frame after current frame and update indices
                const updatedFrames = state.project.frames.map((frame) => ({
                    ...frame,
                    index: frame.index > state.currentFrameIndex ? frame.index + 1 : frame.index
                }));
                updatedFrames.splice(state.currentFrameIndex + 1, 0, newFrame);

                return {
                    ...state,
                    project: {
                        ...state.project,
                        updatedAt: new Date().toISOString(),
                        frames: updatedFrames,
                    },
                    currentFrameIndex: state.currentFrameIndex + 1,
                    isDirty: true,
                };
            }),

            removeFrame: (frameId: string) => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Guard: Prevent deletion if only one frame remains
                if (state.project.frames.length <= 1) return state;

                // Find frame index
                const frameIndex = state.project.frames.findIndex(f => f.id === frameId);
                if (frameIndex === -1) return state;

                // Remove frame and update indices
                const updatedFrames = state.project.frames
                    .filter((_, idx) => idx !== frameIndex)
                    .map((frame, idx) => ({ ...frame, index: idx }));

                // Adjust currentFrameIndex if needed
                let newCurrentFrameIndex = state.currentFrameIndex;
                if (frameIndex < state.currentFrameIndex) {
                    newCurrentFrameIndex = state.currentFrameIndex - 1;
                } else if (frameIndex === state.currentFrameIndex && frameIndex === state.project.frames.length - 1) {
                    newCurrentFrameIndex = state.currentFrameIndex - 1;
                }

                return {
                    ...state,
                    project: {
                        ...state.project,
                        updatedAt: new Date().toISOString(),
                        frames: updatedFrames,
                    },
                    currentFrameIndex: newCurrentFrameIndex,
                    isDirty: true,
                };
            }),

            duplicateFrame: (frameId: string) => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Find frame index
                const frameIndex = state.project.frames.findIndex(f => f.id === frameId);
                if (frameIndex === -1) return state;

                // Clone the frame
                const frameToClone = state.project.frames[frameIndex];
                const newFrameId = crypto.randomUUID();
                const clonedFrame = {
                    id: newFrameId,
                    index: frameIndex + 1,
                    duration: frameToClone.duration,
                    entities: { ...frameToClone.entities },
                    annotations: [...frameToClone.annotations],
                };

                // Insert cloned frame and update indices
                const updatedFrames = state.project.frames.map((frame) => ({
                    ...frame,
                    index: frame.index > frameIndex ? frame.index + 1 : frame.index
                }));
                updatedFrames.splice(frameIndex + 1, 0, clonedFrame);

                return {
                    ...state,
                    project: {
                        ...state.project,
                        updatedAt: new Date().toISOString(),
                        frames: updatedFrames,
                    },
                    isDirty: true,
                };
            }),

            updateFrame: (frameId: string, updates: Partial<FrameUpdate>) => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Find frame
                const frameIndex = state.project.frames.findIndex(f => f.id === frameId);
                if (frameIndex === -1) return state;

                // Apply updates
                const updatedFrames = state.project.frames.map((frame, idx) => {
                    if (idx !== frameIndex) return frame;

                    const updatedFrame = { ...frame };
                    if (updates.duration !== undefined) {
                        updatedFrame.duration = Math.max(
                            VALIDATION.FRAME.DURATION_MIN_MS,
                            Math.min(VALIDATION.FRAME.DURATION_MAX_MS, updates.duration)
                        );
                    }
                    return updatedFrame;
                });

                return {
                    ...state,
                    project: {
                        ...state.project,
                        updatedAt: new Date().toISOString(),
                        frames: updatedFrames,
                    },
                    isDirty: true,
                };
            }),

            addEntity: (entity: EntityCreate) => {
                let newEntityId = '';

                set((state) => {
                    // Guard: Return if no project
                    if (!state.project) return state;

                    // Guard: Return if currentFrameIndex is out of bounds
                    if (state.currentFrameIndex < 0 || state.currentFrameIndex >= state.project.frames.length) {
                        return state;
                    }

                    // Generate new entity ID
                    newEntityId = crypto.randomUUID();

                    // Apply defaults
                    const team = entity.team ?? 'neutral';
                    const color = entity.color ?? DESIGN_TOKENS.colors[team][0];
                    const label = entity.label ?? '';

                    // Clamp coordinates to [0, 2000]
                    const clamp = (value: number, min: number, max: number) =>
                        Math.max(min, Math.min(max, value));

                    const x = clamp(entity.x, VALIDATION.ENTITY.COORD_MIN, VALIDATION.ENTITY.COORD_MAX);
                    const y = clamp(entity.y, VALIDATION.ENTITY.COORD_MIN, VALIDATION.ENTITY.COORD_MAX);

                    // Create full entity object
                    const newEntity: Entity = {
                        id: newEntityId,
                        type: entity.type,
                        x,
                        y,
                        color,
                        label,
                        team,
                    };

                    // Get current frame and add entity
                    const currentFrame = state.project.frames[state.currentFrameIndex];
                    const updatedEntities = {
                        ...currentFrame.entities,
                        [newEntityId]: newEntity,
                    };

                    // Return updated state
                    return {
                        ...state,
                        project: {
                            ...state.project,
                            updatedAt: new Date().toISOString(),
                            frames: state.project.frames.map((frame, idx) =>
                                idx === state.currentFrameIndex
                                    ? { ...frame, entities: updatedEntities }
                                    : frame
                            ),
                        },
                        isDirty: true,
                    };
                });

                return newEntityId;
            },

            updateEntity: (entityId: string, updates: Partial<EntityUpdate>) => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Guard: Return if currentFrameIndex is out of bounds
                if (state.currentFrameIndex < 0 || state.currentFrameIndex >= state.project.frames.length) {
                    return state;
                }

                // Get current frame
                const currentFrame = state.project.frames[state.currentFrameIndex];

                // Guard: Return if entity doesn't exist
                if (!currentFrame.entities[entityId]) return state;

                // Get current entity
                const entity = currentFrame.entities[entityId];

                // Process updates
                const processedUpdates: Partial<Entity> = {};

                // Clamp coordinates if provided
                const clamp = (value: number, min: number, max: number) =>
                    Math.max(min, Math.min(max, value));

                if (updates.x !== undefined) {
                    processedUpdates.x = clamp(updates.x, VALIDATION.ENTITY.COORD_MIN, VALIDATION.ENTITY.COORD_MAX);
                }
                if (updates.y !== undefined) {
                    processedUpdates.y = clamp(updates.y, VALIDATION.ENTITY.COORD_MIN, VALIDATION.ENTITY.COORD_MAX);
                }

                // Validate color if provided (lenient: warn but allow)
                if (updates.color !== undefined) {
                    if (!validateHexColor(updates.color)) {
                        console.warn(`Invalid hex color format: ${updates.color}. Allowing anyway.`);
                    }
                    processedUpdates.color = updates.color;
                }

                // Validate label if provided (lenient: warn but allow)
                if (updates.label !== undefined) {
                    if (!validateEntityLabel(updates.label)) {
                        console.warn(`Invalid entity label: ${updates.label}. Allowing anyway.`);
                    }
                    processedUpdates.label = updates.label;
                }

                // Team update (TypeScript already validated)
                if (updates.team !== undefined) {
                    processedUpdates.team = updates.team;
                }

                // ParentId update (null clears parent, converts to undefined)
                if (updates.parentId !== undefined) {
                    processedUpdates.parentId = updates.parentId === null ? undefined : updates.parentId;
                }

                // Merge updates
                const updatedEntity = { ...entity, ...processedUpdates };

                // Update entities in current frame
                const updatedEntities = {
                    ...currentFrame.entities,
                    [entityId]: updatedEntity,
                };

                // Return updated state
                return {
                    ...state,
                    project: {
                        ...state.project,
                        updatedAt: new Date().toISOString(),
                        frames: state.project.frames.map((frame, idx) =>
                            idx === state.currentFrameIndex
                                ? { ...frame, entities: updatedEntities }
                                : frame
                        ),
                    },
                    isDirty: true,
                };
            }),

            removeEntity: (entityId: string) => set((state) => {
                // Guard: Return if no project
                if (!state.project) return state;

                // Guard: Return if currentFrameIndex is out of bounds
                if (state.currentFrameIndex < 0 || state.currentFrameIndex >= state.project.frames.length) {
                    return state;
                }

                // Get current frame
                const currentFrame = state.project.frames[state.currentFrameIndex];

                // Guard: Return if entity doesn't exist
                if (!currentFrame.entities[entityId]) return state;

                // Remove entity from current frame (destructuring pattern)
                const { [entityId]: removed, ...remainingEntities } = currentFrame.entities;

                // Return updated state
                return {
                    ...state,
                    project: {
                        ...state.project,
                        updatedAt: new Date().toISOString(),
                        frames: state.project.frames.map((frame, idx) =>
                            idx === state.currentFrameIndex
                                ? { ...frame, entities: remainingEntities }
                                : frame
                        ),
                    },
                    isDirty: true,
                };
            }),

            removeEntityGlobally: () => { },
            propagateEntity: () => { },

            addAnnotation: () => '',
            updateAnnotation: () => { },
            removeAnnotation: () => { },

            play: () => set((state) => ({
                ...state,
                isPlaying: true,
            })),

            pause: () => set((state) => ({
                ...state,
                isPlaying: false,
            })),

            reset: () => set((state) => ({
                ...state,
                currentFrameIndex: 0,
                isPlaying: false,
            })),

            setPlaybackSpeed: (speed: PlaybackSpeed) => set((state) => ({
                ...state,
                playbackSpeed: speed,
            })),

            toggleLoop: () => set((state) => ({
                ...state,
                loopPlayback: !state.loopPlayback,
            })),

            setPlaybackPosition: () => { },
        }),
        { name: 'ProjectStore' }
    )
);
