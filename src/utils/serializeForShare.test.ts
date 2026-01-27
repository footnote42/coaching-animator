import { describe, it, expect } from 'vitest';
import { serializeForShare } from './serializeForShare';
import type { Project, Frame, Entity } from '@/types';

describe('serializeForShare', () => {
    it('correctly serializes a simple project', () => {
        // Mock Data
        const mockEntities: Record<string, Entity> = {
            'p1': {
                id: 'p1',
                type: 'player',
                x: 100,
                y: 100,
                team: 'attack',
                color: '#ffffff',
                label: '1'
            },
            'b1': {
                id: 'b1',
                type: 'ball',
                x: 110,
                y: 110,
                team: 'neutral',
                color: '#ffffff',
                label: ''
            },
            'c1': { // Cone - should be ignored
                id: 'c1',
                type: 'cone',
                x: 200,
                y: 200,
                team: 'neutral',
                color: '#ff0000',
                label: ''
            }
        };

        const mockFrame1: Frame = {
            id: 'f1',
            index: 0,
            duration: 1000,
            entities: mockEntities,
            annotations: []
        };

        const mockFrame2: Frame = {
            id: 'f2',
            index: 1,
            duration: 500,
            entities: {
                ...mockEntities,
                'p1': { ...mockEntities['p1'], x: 150, y: 150 }, // Player moved
                'b1': { ...mockEntities['b1'], x: 160, y: 160 }  // Ball moved
            },
            annotations: []
        };

        const mockProject: Project = {
            version: '1.0.0',
            id: 'proj1',
            name: 'Test Project',
            sport: 'rugby-union',
            createdAt: '',
            updatedAt: '',
            settings: {
                showGrid: false,
                gridSpacing: 10,
                defaultTransitionDuration: 1000,
                exportResolution: '720p'
            },
            frames: [mockFrame1, mockFrame2]
        };

        // Execute
        const result = serializeForShare(mockProject);

        // Verify
        expect(result.version).toBe(1);
        expect(result.canvas).toEqual({ width: 2000, height: 2000 });

        // Check Entities (Filter cones, keep players/balls)
        expect(result.entities).toHaveLength(2);
        expect(result.entities.find(e => e.id === 'p1')).toBeDefined();
        expect(result.entities.find(e => e.id === 'b1')).toBeDefined();
        expect(result.entities.find(e => e.id === 'c1')).toBeUndefined();

        // Check Frames
        expect(result.frames).toHaveLength(2);

        // Frame 1
        expect(result.frames[0].t).toBe(0);
        expect(result.frames[0].updates).toHaveLength(2);
        expect(result.frames[0].updates.find(u => u.id === 'p1')?.x).toBe(100);

        // Frame 2
        expect(result.frames[1].t).toBe(1); // 0 + 1000ms
        expect(result.frames[1].updates.find(u => u.id === 'p1')?.x).toBe(150);
    });
});
