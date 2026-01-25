/**
 * SPIKE: Test hook for GIF export validation
 *
 * This hook integrates the gif.js spike with useFrameCapture
 * to test end-to-end GIF export functionality.
 *
 * DELETE after Phase 2 research is complete.
 */

import { useCallback, useState } from 'react';
import Konva from 'konva';
import { useFrameCapture } from './useFrameCapture';
import {
    createGifFromFrames,
    downloadBlob,
    formatMetrics,
    type GifSpikeMetrics
} from '../utils/gifExportSpike';

export interface GifExportSpikeState {
    isExporting: boolean;
    captureProgress: number;
    encodingProgress: number;
    error: string | null;
    metrics: GifSpikeMetrics | null;
}

/**
 * Test hook for GIF export spike
 *
 * Validates gif.js integration with Konva canvas capture.
 * Measures performance metrics for research documentation.
 */
export function useGifExportSpike(stageRef: React.RefObject<Konva.Stage | null>) {
    const frameCapture = useFrameCapture(stageRef);
    const [state, setState] = useState<GifExportSpikeState>({
        isExporting: false,
        captureProgress: 0,
        encodingProgress: 0,
        error: null,
        metrics: null,
    });

    /**
     * Export animation as GIF with performance tracking
     */
    const exportAsGif = useCallback(async () => {
        setState({
            isExporting: true,
            captureProgress: 0,
            encodingProgress: 0,
            error: null,
            metrics: null,
        });

        try {
            // Step 1: Capture frames from canvas
            console.log('[GIF Spike] Starting frame capture...');
            const captureStart = performance.now();

            const captureResult = await frameCapture.captureFrames();

            if (!captureResult) {
                throw new Error('Frame capture failed');
            }

            const captureEnd = performance.now();
            const captureTimeMs = Math.round(captureEnd - captureStart);

            console.log(
                `[GIF Spike] Captured ${captureResult.frames.length} frames in ${captureTimeMs}ms`
            );

            setState(prev => ({ ...prev, captureProgress: 100 }));

            // Step 2: Encode frames to GIF
            console.log('[GIF Spike] Starting GIF encoding...');

            const { blob, metrics } = await createGifFromFrames(
                captureResult.frames,
                captureResult.width,
                captureResult.height,
                captureResult.fps,
                10 // quality setting
            );

            const encodeEnd = performance.now();
            const totalTimeMs = Math.round(encodeEnd - captureStart);

            console.log('[GIF Spike] Encoding complete!');
            console.log(formatMetrics(metrics));
            console.log(`[GIF Spike] Total export time: ${totalTimeMs}ms`);

            setState(prev => ({
                ...prev,
                encodingProgress: 100,
                metrics,
            }));

            // Step 3: Download the GIF
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `rugby-animation-spike-${timestamp}.gif`;
            downloadBlob(blob, filename);

            console.log(`[GIF Spike] Downloaded as ${filename}`);

            // Complete
            setState(prev => ({
                ...prev,
                isExporting: false,
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'GIF export failed';
            console.error('[GIF Spike] Export failed:', error);

            setState(prev => ({
                ...prev,
                isExporting: false,
                error: errorMessage,
            }));
        }
    }, [frameCapture]);

    return {
        ...state,
        exportAsGif,
        isCapturing: frameCapture.isCapturing,
        frameCount: frameCapture.frameCount,
    };
}
