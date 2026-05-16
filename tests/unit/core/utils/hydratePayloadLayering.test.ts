import { describe, it, expect } from 'vitest';
import { hydrateSharePayload } from '@/core/utils/hydratePayload';
import { SharePayloadV2 } from '@/core/types/share';

describe('hydrateSharePayload layering', () => {
  it('hydrates zIndexOffset from V2 payload', () => {
    const payload: SharePayloadV2 = {
      version: 2,
      name: 'Test Animation',
      sport: 'rugby-union',
      canvas: { width: 800, height: 600 },
      entities: [
        { id: 'e1', type: 'player', team: 'attack', x: 100, y: 100, zIndexOffset: 5 }
      ],
      frames: [
        { t: 0, updates: [] }
      ]
    };

    const project = hydrateSharePayload(payload);
    const entity = project.frames[0].entities['e1'];
    expect(entity.zIndexOffset).toBe(5);
  });

  it('defaults zIndexOffset to 0 if missing in V2 payload', () => {
    const payload: SharePayloadV2 = {
      version: 2,
      name: 'Test Animation',
      sport: 'rugby-union',
      canvas: { width: 800, height: 600 },
      entities: [
        { id: 'e1', type: 'player', team: 'attack', x: 100, y: 100 }
      ],
      frames: [
        { t: 0, updates: [] }
      ]
    };

    const project = hydrateSharePayload(payload);
    const entity = project.frames[0].entities['e1'];
    expect(entity.zIndexOffset).toBe(0);
  });
});
