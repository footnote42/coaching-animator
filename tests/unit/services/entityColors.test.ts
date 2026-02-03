import { describe, it, expect } from 'vitest';
import { EntityColors } from '../../../src/services/entityColors';
import { DESIGN_TOKENS } from '../../../src/constants/design-tokens';

describe('EntityColors', () => {
    describe('getDefault', () => {
        it('returns correct default for ball', () => {
            expect(EntityColors.getDefault('ball')).toBe(DESIGN_TOKENS.colours.neutral[1]);
        });

        it('returns correct default for cone', () => {
            expect(EntityColors.getDefault('cone')).toBe(DESIGN_TOKENS.colours.neutral[2]);
        });

        it('returns correct default for marker', () => {
            expect(EntityColors.getDefault('marker')).toBe(DESIGN_TOKENS.colours.primary);
        });

        it('returns correct default for tackle-shield', () => {
            expect(EntityColors.getDefault('tackle-shield')).toBe(DESIGN_TOKENS.colours.defense[0]);
        });

        it('returns correct default for tackle-bag', () => {
            expect(EntityColors.getDefault('tackle-bag')).toBe(DESIGN_TOKENS.colours.attack[3]);
        });

        it('returns attack color for attack player', () => {
            expect(EntityColors.getDefault('player', 'attack')).toBe(DESIGN_TOKENS.colours.attack[0]);
        });

        it('returns defense color for defense player', () => {
            expect(EntityColors.getDefault('player', 'defense')).toBe(DESIGN_TOKENS.colours.defense[0]);
        });

        it('returns neutral color for neutral player', () => {
            expect(EntityColors.getDefault('player', 'neutral')).toBe(DESIGN_TOKENS.colours.neutral[0]);
        });

        it('returns neutral color for player with no team', () => {
            expect(EntityColors.getDefault('player')).toBe(DESIGN_TOKENS.colours.neutral[0]);
        });
    });

    describe('resolve', () => {
        it('returns provided color when valid', () => {
            expect(EntityColors.resolve('#FF0000', 'cone')).toBe('#FF0000');
        });

        it('returns provided color with lowercase hex', () => {
            expect(EntityColors.resolve('#aabbcc', 'ball')).toBe('#aabbcc');
        });

        it('falls back to default when color is undefined', () => {
            expect(EntityColors.resolve(undefined, 'cone')).toBe(DESIGN_TOKENS.colours.neutral[2]);
        });

        it('falls back to default when color is null', () => {
            expect(EntityColors.resolve(null, 'ball')).toBe(DESIGN_TOKENS.colours.neutral[1]);
        });

        // Edge case: empty string treated as "no color set"
        it('treats empty string as missing color', () => {
            expect(EntityColors.resolve('', 'cone')).toBe(DESIGN_TOKENS.colours.neutral[2]);
        });

        it('treats whitespace-only string as missing color', () => {
            expect(EntityColors.resolve('   ', 'ball')).toBe(DESIGN_TOKENS.colours.neutral[1]);
        });

        it('respects team for player defaults', () => {
            expect(EntityColors.resolve(undefined, 'player', 'attack')).toBe(DESIGN_TOKENS.colours.attack[0]);
            expect(EntityColors.resolve(undefined, 'player', 'defense')).toBe(DESIGN_TOKENS.colours.defense[0]);
        });
    });

    describe('annotation', () => {
        it('returns the annotation color from design tokens', () => {
            expect(EntityColors.annotation).toBe(DESIGN_TOKENS.colours.annotation);
        });
    });
});
