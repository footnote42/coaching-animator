import fs from 'fs';

// Constants
const MAX_FRAMES = 50;
const MAX_ENTITIES = 40; // 30 players + 10 equipment
const MAX_ANNOTATIONS = 5; // per frame

function generateWorstCasePayload() {
    const entities = [];
    for (let i = 0; i < MAX_ENTITIES; i++) {
        entities.push({
            id: `entity-${i}`,
            type: i < 30 ? 'player' : 'cone',
            team: i < 15 ? 'attack' : i < 30 ? 'defense' : 'neutral',
            x: Math.random() * 2000,
            y: Math.random() * 2000,
            label: `Player ${i}`,
            color: '#ff0000',
            orientation: 'up'
        });
    }

    const frames = [];
    for (let i = 0; i < MAX_FRAMES; i++) {
        const updates = entities.map(e => ({
            id: e.id,
            x: Math.random() * 2000, // Full float precision
            y: Math.random() * 2000
        }));

        const annotations = [];
        for (let j = 0; j < MAX_ANNOTATIONS; j++) {
            annotations.push({
                id: `ann-${i}-${j}`,
                type: 'arrow',
                points: [100, 100, 200, 200, 300, 300], // 3 points
                color: '#ffff00',
                startFrameId: `frame-${i}`,
                endFrameId: `frame-${i}`
            });
        }

        frames.push({
            t: i * 2,
            updates,
            annotations // New V2 field
        });
    }

    return {
        version: 2,
        sport: 'rugby-union',
        canvas: { width: 2000, height: 2000 },
        entities, // Full entity definitions
        frames
    };
}

const payload = generateWorstCasePayload();
const json = JSON.stringify(payload);
const sizeKB = json.length / 1024;

console.log('--- Payload Stress Test ---');
console.log(`Entities: ${MAX_ENTITIES}`);
console.log(`Frames: ${MAX_FRAMES}`);
console.log(`Annotations Total: ${MAX_FRAMES * MAX_ANNOTATIONS}`);
console.log(`Total Size: ${sizeKB.toFixed(2)} KB`);
console.log(`Safe Limit: 100 KB`);
console.log(`Status: ${sizeKB < 100 ? 'PASS' : 'FAIL'}`);

if (sizeKB >= 100) {
    console.error("CRITICAL: Payload exceeds safety limit!");
    process.exit(1);
}
