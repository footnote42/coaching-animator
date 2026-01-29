import type { Project } from '@/types';
import type { SharePayloadV1 } from '@/types/share';

export function serializeForShare(project: Project): SharePayloadV1 {
    // Calculate absolute time for each frame
    let t = 0;

    const frames = project.frames.map((frame) => {
        // For the first frame, t is 0. For subsequent frames, add duration of PREVIOUS frame
        // Note: The duration property on a frame usually controls how long THAT frame stays or transitions to the next.
        // In our model (Project.frames), frame.duration is usually "transition duration to next frame" or "duration of this frame".
        // Let's assume frame[i].duration is the time until frame[i+1].

        // HOWEVER, the implementation plan says:
        // t += frame.duration / 1000;
        // but usually t starts at 0 for frame 0.
        // So frame 0 is at t=0.
        // Frame 1 is at t = frame[0].duration.

        const currentT = t;

        // Update t for the NEXT frame
        t += frame.duration / 1000; // Convert ms to seconds

        // Extract only position updates for player/ball entities
        const updates = Object.values(frame.entities)
            .filter(e => e.type === 'player' || e.type === 'ball')
            .map(e => ({ id: e.id, x: e.x, y: e.y }));

        return {
            t: currentT,
            updates
        };
    });

    // Extract entities from first frame
    // We assume entities don't appear/disappear mid-animation for this V1 sharing
    // If they do, this logic might need refinement, but for V1 we stick to the plan.
    const initialEntities = project.frames.length > 0 ? project.frames[0].entities : {};

    const entities = Object.values(initialEntities)
        .filter(e => e.type === 'player' || e.type === 'ball')
        .map(e => ({
            id: e.id,
            type: e.type as 'player' | 'ball',
            team: e.team === 'defense' ? 'defence' : e.team as 'attack' | 'defence', // definitions in TeamType might include 'neutral', need casting care or check
            x: e.x,
            y: e.y
        }));

    return {
        version: 1,
        canvas: {
            width: 2000,
            height: 2000 // Standard coordinate space
        },
        entities: entities as any, // Cast to avoid strict type issues if TeamType has extra values
        frames
    };
}
