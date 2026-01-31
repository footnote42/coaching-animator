import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../../src/store/projectStore';

describe('ProjectStore - newProject', () => {
    beforeEach(() => {
        // Reset store state before each test
        useProjectStore.setState({
            project: null,
            currentFrameIndex: 0,
            isPlaying: false,
            isDirty: false,
            playbackSpeed: 1,
            loopPlayback: false,
        });
    });

    it('should initialize a project with valid UUIDs', () => {
        const { newProject } = useProjectStore.getState();

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project).toBeDefined();
        expect(updatedState.project?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        expect(updatedState.project?.frames[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should set the default sport to rugby-union', () => {
        const { newProject } = useProjectStore.getState();

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project?.sport).toBe('rugby-union');
    });

    it('should create exactly one initial frame', () => {
        const { newProject } = useProjectStore.getState();

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project?.frames).toHaveLength(1);
        expect(updatedState.project?.frames[0].index).toBe(0);
        expect(updatedState.project?.frames[0].duration).toBe(2000);
        expect(updatedState.project?.frames[0].entities).toEqual({});
        expect(updatedState.project?.frames[0].annotations).toEqual([]);
    });

    it('should reset currentFrameIndex to 0', () => {
        const { newProject } = useProjectStore.getState();

        // Manually set currentFrameIndex to non-zero value
        useProjectStore.setState({ currentFrameIndex: 5 });

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.currentFrameIndex).toBe(0);
    });

    it('should reset isPlaying to false', () => {
        const { newProject } = useProjectStore.getState();

        // Manually set isPlaying to true
        useProjectStore.setState({ isPlaying: true });

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.isPlaying).toBe(false);
    });

    it('should reset isDirty to false', () => {
        const { newProject } = useProjectStore.getState();

        // Manually set isDirty to true
        useProjectStore.setState({ isDirty: true });

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.isDirty).toBe(false);
    });

    it('should set default project name to "Untitled Play"', () => {
        const { newProject } = useProjectStore.getState();

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project?.name).toBe('Untitled Play');
    });

    it('should initialize with default settings', () => {
        const { newProject } = useProjectStore.getState();

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project?.settings).toEqual({
            showGrid: true,
            gridSpacing: 50,
            defaultTransitionDuration: 2000,
            exportResolution: '720p',
        });
    });

    it('should set version to 1.0', () => {
        const { newProject } = useProjectStore.getState();

        newProject();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project?.version).toBe('1.0');
    });

    it('should set createdAt and updatedAt to current time', () => {
        const { newProject } = useProjectStore.getState();

        const beforeTime = new Date().toISOString();
        newProject();
        const afterTime = new Date().toISOString();

        const updatedState = useProjectStore.getState();
        expect(updatedState.project?.createdAt).toBeDefined();
        expect(updatedState.project?.updatedAt).toBeDefined();
        expect(updatedState.project?.createdAt).toBe(updatedState.project?.updatedAt);

        // Verify timestamps are within reasonable range
        expect(updatedState.project?.createdAt! >= beforeTime).toBe(true);
        expect(updatedState.project?.createdAt! <= afterTime).toBe(true);
    });
});
