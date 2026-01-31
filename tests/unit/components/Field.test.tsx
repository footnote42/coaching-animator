import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Field } from '../../../src/components/Canvas/Field';

// Mock react-konva
vi.mock('react-konva', () => {
    return {
        Stage: ({ children }: any) => <div data-testid="konva-stage">{children}</div>,
        Layer: ({ children }: any) => <div data-testid="konva-layer">{children}</div>,
        Image: ({ image, width, height }: any) => (
            <div
                data-testid="konva-image"
                data-sport={image?.src}
                style={{ width, height }}
            />
        ),
    };
});

describe('Field Component', () => {
    beforeEach(() => {
        // Mock global Image constructor
        global.Image = class {
            onload: (() => void) | null = null;
            src: string = '';
            constructor() {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        } as any;
    });

    it('renders with rugby-union by default if provided as prop', async () => {
        render(
            <Field sport="rugby-union" width={2000} height={1400} />
        );

        // We need to wait for the image to "load" (our mock setTimeout)
        await vi.waitFor(() => {
            const img = document.querySelector('[data-testid="konva-image"]');
            expect(img).toBeTruthy();
        });

        const img = document.querySelector('[data-testid="konva-image"]');
        expect(img?.getAttribute('data-sport')).toContain('rugby-union.svg');
    });

    it('changes field markings when sport prop changes', async () => {
        const { rerender } = render(
            <Field sport="rugby-union" width={2000} height={1400} />
        );

        await vi.waitFor(() => {
            expect(document.querySelector('[data-testid="konva-image"]')).toBeTruthy();
        });

        rerender(
            <Field sport="soccer" width={2000} height={1295} />
        );

        await vi.waitFor(() => {
            const img = document.querySelector('[data-testid="konva-image"]');
            expect(img?.getAttribute('data-sport')).toContain('soccer.svg');
        });
    });
});
