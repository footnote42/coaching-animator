// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { Field } from '../../../src/components/Canvas/Field';

// Mock react-konva
vi.mock('react-konva', () => {
    return {
        Stage: ({ children }: any) => <div data-testid="konva-stage">{children}</div>,
        Layer: ({ children }: any) => <div data-testid="konva-layer">{children}</div>,
        Image: ({ image, width, height }: any) => {
            if (!image || !image.src) return <div data-testid="konva-layer-empty" />;
            return (
                <div
                    data-testid="konva-image"
                    data-sport={image.src}
                    style={{ width, height }}
                />
            );
        },
    };
});

describe('Field Component', () => {
    beforeEach(() => {
        // Reset and mock Image synchronously
        global.Image = class {
            _onload: (() => void) | null = null;
            _src: string = '';

            get onload() { return this._onload; }
            set onload(val: (() => void) | null) {
                this._onload = val;
                if (this._src && val) val();
            }

            get src() { return this._src; }
            set src(val: string) {
                this._src = val;
                if (this._onload) this._onload();
            }

            width = 0;
            height = 0;
        } as any;
        window.Image = global.Image;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with rugby-union by default', async () => {
        render(<Field sport="rugby-union" width={2000} height={1400} />);

        await waitFor(() => {
            const img = screen.queryByTestId('konva-image');
            expect(img).toBeTruthy();
            expect(img?.getAttribute('data-sport')).toContain('rugby-union.svg');
        });
    });

    it('renders with soccer markings', async () => {
        render(<Field sport="soccer" width={2000} height={1295} />);

        await waitFor(() => {
            const img = screen.queryByTestId('konva-image');
            expect(img).toBeTruthy();
            expect(img?.getAttribute('data-sport')).toContain('soccer.svg');
        });
    });

    it('handles layout variants', async () => {
        render(<Field sport="rugby-union" layout="attack" width={2000} height={1400} />);

        await waitFor(() => {
            const img = screen.queryByTestId('konva-image');
            expect(img).toBeTruthy();
            expect(img?.getAttribute('data-sport')).toContain('rugby-union-attack.svg');
        });
    });
});
