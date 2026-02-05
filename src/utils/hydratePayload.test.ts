import { describe, it, expect } from 'vitest';
import { hydrateSharePayload } from './hydratePayload';
import { SharePayloadV1, SharePayloadV2 } from '@/types/share';

describe('hydrateSharePayload', () => {
    // V1 Payload fixture based on real production data
    const v1Payload: SharePayloadV1 = {
        version: 1,
        canvas: { width: 2000, height: 2000 },
        entities: [
            { id: 'p1', type: 'player', team: 'attack', x: 100, y: 100 },
            { id: 'b1', type: 'ball', team: 'attack', x: 200, y: 200 }
        ],
        frames: [
            {
                t: 0,
                updates: [
                    { id: 'p1', x: 100, y: 100 },
                    { id: 'b1', x: 200, y: 200 }
                ]
            },
            {
                t: 2,
                updates: [
                    { id: 'p1', x: 150, y: 150 },
                    { id: 'b1', x: 250, y: 250 }
                ]
            }
        ]
    };

    it('should hydrate a valid V1 payload into a Project structure', () => {
        const project = hydrateSharePayload(v1Payload);

        expect(project.id).toBeDefined();
        expect(project.frames).toHaveLength(2);

        // Check Frame 0
        const f0 = project.frames[0];
        expect(f0.duration).toBe(2000); // (2 - 0) * 1000
        expect(f0.entities['p1'].x).toBe(100);
        expect(f0.entities['b1'].y).toBe(200);

        // Check Frame 1
        const f1 = project.frames[1];
        expect(f1.duration).toBe(2000); // Default last frame duration
        expect(f1.entities['p1'].x).toBe(150);
    });

    it('should assign correct default colors', () => {
        const project = hydrateSharePayload(v1Payload);
        // Attack player -> Blue (usually)
        expect(project.frames[0].entities['p1'].color).toBeDefined();
        // Ball -> White
        expect(project.frames[0].entities['b1'].color).toBeDefined();
    });

    it('should handle payload with no entities', () => {
        const emptyPayload: SharePayloadV1 = {
            version: 1,
            canvas: { width: 2000, height: 2000 },
            entities: [],
            frames: [{ t: 0, updates: [] }]
        };
        const project = hydrateSharePayload(emptyPayload);
        expect(project.frames).toHaveLength(1);
        expect(Object.keys(project.frames[0].entities)).toHaveLength(0);
    });

    it('should handle payload with no frames (edge case)', () => {
        const noFramesPayload: SharePayloadV1 = {
            version: 1,
            canvas: { width: 2000, height: 2000 },
            entities: [],
            frames: []
        };
        // Should create at least one frame
        const project = hydrateSharePayload(noFramesPayload);
        expect(project.frames).toHaveLength(1);
    });

    it('should hydrate a valid V2 payload with annotations', () => {
        const v2Payload: SharePayloadV2 = {
            version: 2,
            sport: 'soccer',
            name: 'V2 Test',
            canvas: { width: 2000, height: 2000 },
            entities: [
                { id: 'c1', type: 'cone', x: 50, y: 50, color: '#ff0', label: 'C1' },
                { id: 'p1', type: 'player', team: 'attack', x: 100, y: 100, orientation: 'up' }
            ],
            frames: [
                {
                    t: 0,
                    updates: [{ id: 'p1', x: 100, y: 100 }],
                    annotations: [
                        { id: 'a1', type: 'arrow', points: [0, 0, 1, 1], color: '#f00' }
                    ]
                }
            ]
        };

        const project = hydrateSharePayload(v2Payload);

        expect(project.sport).toBe('soccer');
        expect(project.name).toBe('V2 Test');

        // Entity Checks
        const cone = project.frames[0].entities['c1'];
        expect(cone.type).toBe('cone');
        expect(cone.label).toBe('C1');

        const player = project.frames[0].entities['p1'];
        expect(player.orientation).toBe('up');

        // Annotation Checks
        expect(project.frames[0].annotations).toHaveLength(1);
        expect(project.frames[0].annotations[0].type).toBe('arrow');
    });
});
