import { z } from 'zod';

export const SharePayloadSchema = z.object({
    version: z.literal(1),
    canvas: z.object({
        width: z.number(),
        height: z.number(),
    }),
    entities: z.array(
        z.object({
            id: z.string(),
            type: z.enum(['player', 'ball']),
            team: z.enum(['attack', 'defence']),
            x: z.number(),
            y: z.number(),
        })
    ),
    frames: z.array(
        z.object({
            t: z.number(),
            updates: z.array(
                z.object({
                    id: z.string(),
                    x: z.number(),
                    y: z.number(),
                })
            ),
        })
    ),
});

export type SharePayloadV1 = z.infer<typeof SharePayloadSchema>;
