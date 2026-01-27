export interface SharePayloadV1 {
    version: 1;
    canvas: {
        width: number;
        height: number;
    };
    entities: Array<{
        id: string;
        type: 'player' | 'ball';
        team: 'attack' | 'defense';
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
