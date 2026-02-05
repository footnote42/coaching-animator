import type { Project } from '@/types';
import type { SharePayloadV2 } from '@/types/share';

const fmt = (n: number) => Math.round(n * 10) / 10;

export function serializeForShare(project: Project): SharePayloadV2 {
    let t = 0;

    const frames = project.frames.map((frame) => {
        const currentT = t;
        t += frame.duration / 1000;

        // Extract updates (all entities)
        const updates = Object.values(frame.entities).map(e => ({
            id: e.id,
            x: fmt(e.x),
            y: fmt(e.y)
        }));

        // Extract annotations with rounding
        const annotations = frame.annotations.map(a => ({
            id: a.id,
            type: a.type,
            points: a.points.map(fmt),
            color: a.color,
            startFrameId: a.startFrameId,
            endFrameId: a.endFrameId
        }));

        const f: SharePayloadV2['frames'][0] = {
            t: currentT,
            updates
        };

        // Only include annotations field if not empty (save space)
        if (annotations.length > 0) {
            f.annotations = annotations;
        }

        return f;
    });

    const initialEntities = project.frames.length > 0 ? project.frames[0].entities : {};

    const entities = Object.values(initialEntities).map(e => ({
        id: e.id,
        type: e.type,
        team: e.team,
        x: fmt(e.x),
        y: fmt(e.y),
        label: e.label,
        color: e.color,
        orientation: e.orientation
    }));

    return {
        version: 2,
        sport: project.sport,
        name: project.name,
        canvas: {
            width: 2000,
            height: 2000
        },
        entities,
        frames,
        settings: {
            pitchLayout: project.settings.pitchLayout || 'standard'
        }
    };
}
