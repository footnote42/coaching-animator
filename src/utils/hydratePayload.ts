import { SharePayload, SharePayloadV1, SharePayloadV2 } from '@/types/share';
import { Entity, Frame, TeamType, Project, EntityType, PitchLayout, SportType, EntityOrientation, AnnotationType } from '@/types';
import { EntityColors } from '@/services/entityColors';

/**
 * Hydrates a pure share payload (V1 or V2) into a full Project structure.
 * This function must remain PURE (no side effects, no store access).
 */
export function hydrateSharePayload(payload: SharePayload): Project {
    const now = new Date().toISOString();
    const projectId = crypto.randomUUID();
    const isV2 = payload.version === 2;

    // Reconstruct frames
    const frames: Frame[] = [];
    const currentEntities: Record<string, Entity> = {};

    // Helper to safely resolve team/color
    type RawEntity = SharePayloadV1['entities'][0] | SharePayloadV2['entities'][0];
    const resolveEntityProps = (e: RawEntity) => {
        const type = e.type as EntityType;
        // Handle V1 'defence' vs 'defense' typo if present
        const rawTeam = e.team as string | undefined;
        let team: TeamType = rawTeam === 'defence' ? 'defense' : (rawTeam as TeamType);

        // If team is undefined (e.g. equipment in V2), default to neutral
        if (!team) team = 'neutral';

        // V2 might provide color/label, V1 does not
        const color = ('color' in e && e.color) ? e.color : EntityColors.getDefault(type, team);
        const label = ('label' in e && e.label) ? e.label : '';

        return { type, team, color, label };
    };

    // Initialize entities from payload (base state)
    if (payload.entities) {
        (payload.entities as RawEntity[]).forEach(e => {
            const props = resolveEntityProps(e);
            currentEntities[e.id] = {
                id: e.id,
                type: props.type,
                team: props.team,
                color: props.color,
                label: props.label,
                x: e.x,
                y: e.y,
                parentId: undefined, // Setup below if needed
                orientation: ('orientation' in e && e.orientation) ? e.orientation as EntityOrientation : undefined
            };
        });
    }

    // Process frames
    for (let i = 0; i < payload.frames.length; i++) {
        const frameData = payload.frames[i];
        const nextFrameData = payload.frames[i + 1];

        // Apply updates to current entities
        if (frameData.updates) {
            frameData.updates.forEach(u => {
                if (currentEntities[u.id]) {
                    currentEntities[u.id] = { ...currentEntities[u.id], x: u.x, y: u.y };
                }
            });
        }

        // Calculate duration
        const duration = nextFrameData
            ? (nextFrameData.t - frameData.t) * 1000
            : 2000;

        // Clone entities state
        const frameEntities: Record<string, Entity> = {};
        Object.values(currentEntities).forEach(e => {
            frameEntities[e.id] = { ...e };
        });

        // Handle Annotations (V2 only)
        const annotations = isV2 && 'annotations' in frameData && Array.isArray(frameData.annotations)
            ? (frameData as SharePayloadV2['frames'][0]).annotations?.map(a => ({
                id: a.id || crypto.randomUUID(),
                type: a.type as AnnotationType,
                points: a.points,
                color: a.color,
                startFrameId: '', // Will be fixed below
                endFrameId: ''
            })) || []
            : [];

        const frameId = crypto.randomUUID();

        // Fix annotation frame IDs if missing
        annotations.forEach((a) => {
            if (!a.startFrameId) a.startFrameId = frameId;
            if (!a.endFrameId) a.endFrameId = frameId;
        });

        frames.push({
            id: frameId,
            index: i,
            duration,
            entities: frameEntities,
            annotations
        });
    }

    // Edge case: No frames
    if (frames.length === 0) {
        frames.push({
            id: crypto.randomUUID(),
            index: 0,
            duration: 2000,
            entities: { ...currentEntities },
            annotations: []
        });
    }

    // Extract settings (V2) or defaults (V1)
    const sport = isV2 ? (payload as SharePayloadV2).sport as SportType : 'rugby-union';
    const pitchLayout = isV2 ? (payload as SharePayloadV2).settings?.pitchLayout as PitchLayout : 'standard';
    const name = isV2 ? (payload as SharePayloadV2).name || 'Shared Animation' : 'Shared Animation';

    return {
        version: '1.0',
        id: projectId,
        name,
        sport,
        createdAt: now,
        updatedAt: now,
        frames,
        settings: {
            showGrid: false,
            gridSpacing: 50,
            defaultTransitionDuration: 1000,
            exportResolution: '720p',
            pitchLayout
        }
    };
}
