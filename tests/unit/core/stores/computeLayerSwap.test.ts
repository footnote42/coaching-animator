import { describe, it, expect } from 'vitest';
import { computeLayerSwap } from '@/core/stores/projectStore';
import { Entity } from '@/core/types';

describe('computeLayerSwap', () => {
  const mockEntities: Entity[] = [
    { id: 'p1', type: 'player', team: 'attack', x: 0, y: 0, zIndexOffset: 0, color: '#ff0000', label: '1' },
    { id: 'p2', type: 'player', team: 'attack', x: 0, y: 0, zIndexOffset: 1, color: '#ff0000', label: '2' },
    { id: 'p3', type: 'player', team: 'attack', x: 0, y: 0, zIndexOffset: 2, color: '#ff0000', label: '3' },
    { id: 'c1', type: 'cone', team: 'neutral', x: 0, y: 0, zIndexOffset: 0, color: '#ffff00', label: '' },
  ];

  it('swaps zIndexOffset with forward peer of same type', () => {
    const updates = computeLayerSwap(mockEntities, 'p1', 'forward');
    expect(updates).toHaveLength(2);
    expect(updates).toContainEqual({ id: 'p1', zIndexOffset: 1 });
    expect(updates).toContainEqual({ id: 'p2', zIndexOffset: 0 });
  });

  it('swaps zIndexOffset with backward peer of same type', () => {
    const updates = computeLayerSwap(mockEntities, 'p3', 'backward');
    expect(updates).toHaveLength(2);
    expect(updates).toContainEqual({ id: 'p3', zIndexOffset: 1 });
    expect(updates).toContainEqual({ id: 'p2', zIndexOffset: 2 });
  });

  it('returns null if moving forward from front', () => {
    const updates = computeLayerSwap(mockEntities, 'p3', 'forward');
    expect(updates).toBeNull();
  });

  it('returns null if moving backward from back', () => {
    const updates = computeLayerSwap(mockEntities, 'p1', 'backward');
    expect(updates).toBeNull();
  });

  it('returns null if entity does not exist', () => {
    const updates = computeLayerSwap(mockEntities, 'non-existent', 'forward');
    expect(updates).toBeNull();
  });

  it('handles tie-breaking with ID when zIndexOffset is equal', () => {
    const entitiesWithTie: Entity[] = [
      { id: 'pA', type: 'player', team: 'attack', x: 0, y: 0, zIndexOffset: 0, color: '#ff0000', label: 'A' },
      { id: 'pB', type: 'player', team: 'attack', x: 0, y: 0, zIndexOffset: 0, color: '#ff0000', label: 'B' },
    ];
    // pA < pB (localeCompare)
    // Forward from pA should swap with pB
    const updates = computeLayerSwap(entitiesWithTie, 'pA', 'forward');
    expect(updates).toHaveLength(2);
    expect(updates).toContainEqual({ id: 'pA', zIndexOffset: 1 });
    expect(updates).toContainEqual({ id: 'pB', zIndexOffset: 0 });
  });
});
