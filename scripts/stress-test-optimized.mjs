import fs from 'fs';

// Constants
const MAX_FRAMES = 50;
const MAX_ENTITIES = 40;
const MAX_ANNOTATIONS = 5;

// Optimization: Round coordinates to 1 decimal place
const fmt = (n) => Number(n.toFixed(1));

function generateOptimizedPayload() {
    const entities = [];
    for (let i = 0; i < MAX_ENTITIES; i++) {
        entities.push({
            id: `e${i}`, // Short ID
            type: i < 30 ? 'player' : 'cone',
            team: i < 15 ? 'attack' : i < 30 ? 'defense' : 'neutral',
            x: fmt(Math.random() * 2000),
            y: fmt(Math.random() * 2000),
            label: `P${i}`,
            color: '#f00',
            orientation: 'up'
        });
    }

    const frames = [];
    for (let i = 0; i < MAX_FRAMES; i++) {
        const updates = entities.map(e => ({
            id: e.id,
            x: fmt(Math.random() * 2000),
            y: fmt(Math.random() * 2000)
        }));

        const annotations = [];
        for (let j = 0; j < MAX_ANNOTATIONS; j++) {
            annotations.push({
                id: `a${i}${j}`,
                type: 'arrow',
                points: [100, 100, 200, 200, 300, 300], // integers usually
                color: '#ff0',
                startFrameId: `f${i}`,
                endFrameId: `f${i}`
            });
        }

        frames.push({
            t: i * 2,
            updates,
            annotations
        });
    }

    return {
        version: 2,
        sport: 'rugby-union',
        canvas: { width: 2000, height: 2000 },
        entities,
        frames
    };
}

const payload = generateOptimizedPayload();
const json = JSON.stringify(payload);
const sizeKB = json.length / 1024;

console.log('--- Payload Optimization Test ---');
console.log(`Entities: ${MAX_ENTITIES}`);
console.log(`Frames: ${MAX_FRAMES}`);
console.log(`Total Size: ${sizeKB.toFixed(2)} KB`);
console.log(`Safe Limit: 500 KB`);
console.log(`Status: ${sizeKB < 500 ? 'PASS' : 'FAIL'}`);
