export interface SharePayloadV1 {
    version: 1;
    canvas: {
        width: number;
        height: number;
    };
    entities: Array<{
        id: string;
        type: 'player' | 'ball';
        team: 'attack' | 'defence';
        x: number;
        y: number;
    }>;
    frames: Array<{
        t: number; // seconds from start
        updates: Array<{
            id: string;
            x: number;
            y: number;
        }>;
    }>;
}

export interface SharePayloadV2 {
    version: 2;
    name?: string;
    sport: string;
    canvas: {
        width: number;
        height: number;
    };
    entities: Array<{
        id: string;
        type: string;
        team?: string;
        x: number;
        y: number;
        label?: string;
        color?: string;
        orientation?: string;
    }>;
    frames: Array<{
        t: number;
        updates: Array<{
            id: string;
            x: number;
            y: number;
        }>;
        annotations?: Array<{
            id: string;
            type: string;
            points: number[];
            color: string;
        }>;
    }>;
    settings?: {
        pitchLayout?: string;
    };
}

export type SharePayload = SharePayloadV1 | SharePayloadV2;
