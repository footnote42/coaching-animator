import { useCallback, useState } from 'react';
import Konva from 'konva';
import GIF from 'gif.js';
import { useProjectStore } from '../store/projectStore';
import { useFrameCapture } from './useFrameCapture';
import { VALIDATION } from '../constants/validation';
import { detectBrowser, getRecommendedFormat } from '../../lib/browser-detect';

export type ExportStatus = 'idle' | 'preparing' | 'capturing' | 'encoding' | 'complete' | 'error';
export type ExportFormat = 'webm' | 'mp4' | 'gif' | 'auto';

export interface ExportState {
    status: ExportStatus;
    progress: number; // 0-100
    error: string | null;
    phase: string;
    fileSize?: number;
    format?: ExportFormat;
}

/**
 * Hook to manage animation export.
 *
 * Exports animation as WebM video using MediaRecorder API.
 * Falls back to GIF for Safari/iOS which don't support WebM encoding.
 * Provides progress tracking and error handling for the export process.
 */
export function useExport(stageRef: React.RefObject<Konva.Stage | null>) {
    const [state, setState] = useState<ExportState>({
        status: 'idle',
        progress: 0,
        error: null,
        phase: '',
    });

    const browserInfo = detectBrowser();
    const recommendedFormat = getRecommendedFormat();

    const project = useProjectStore((state) => state.project);

    const frameCapture = useFrameCapture(stageRef);

    /**
     * Validate project before export
     */
    const validateExport = useCallback((): { valid: boolean; error?: string } => {
        if (!project) {
            return { valid: false, error: 'No project loaded' };
        }

        if (project.frames.length < 2) {
            return { valid: false, error: 'Minimum 2 frames required for export' };
        }

        // Calculate total animation duration
        const totalDuration = project.frames.reduce((sum, frame) => sum + frame.duration, 0);
        const maxDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (totalDuration > maxDuration) {
            return { valid: false, error: 'Animation exceeds maximum duration of 5 minutes' };
        }

        return { valid: true };
    }, [project]);

    /**
     * Export frames as GIF using gif.js library.
     * Used as fallback for Safari/iOS which don't support WebM encoding.
     */
    const exportAsGif = useCallback(async (captureResult: { frames: Blob[]; fps: number; width: number; height: number }): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: captureResult.width,
                height: captureResult.height,
                workerScript: '/gif-worker/gif.worker.js',
            });

            const frameDelay = Math.round(1000 / captureResult.fps);
            let loadedFrames = 0;

            // Load each frame blob as an image and add to GIF
            const loadFrame = async (index: number) => {
                if (index >= captureResult.frames.length) {
                    // All frames loaded, render GIF
                    gif.render();
                    return;
                }

                const blob = captureResult.frames[index];
                const img = new Image();
                const url = URL.createObjectURL(blob);

                img.onload = () => {
                    gif.addFrame(img, { delay: frameDelay, copy: true });
                    URL.revokeObjectURL(url);
                    loadedFrames++;
                    setState(prev => ({
                        ...prev,
                        progress: Math.round((loadedFrames / captureResult.frames.length) * 50) + 50,
                        phase: `Encoding frame ${loadedFrames}/${captureResult.frames.length}`,
                    }));
                    loadFrame(index + 1);
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error(`Failed to load frame ${index}`));
                };

                img.src = url;
            };

            gif.on('finished', (blob: Blob) => {
                resolve(blob);
            });

            gif.on('error', (error: Error) => {
                reject(error);
            });

            loadFrame(0);
        });
    }, []);

    /**
     * Export frames as WebM video using MediaRecorder API.
     */
    const exportAsWebM = useCallback(async (captureResult: { frames: Blob[]; fps: number; width: number; height: number }): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        canvas.width = captureResult.width;
        canvas.height = captureResult.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        const stream = canvas.captureStream(captureResult.fps);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm',
            videoBitsPerSecond: 2500000,
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.start();
        
        for (let i = 0; i < captureResult.frames.length; i++) {
            const frame = captureResult.frames[i];
            const img = new Image();
            
            await new Promise<void>((resolve) => {
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                };
                img.src = URL.createObjectURL(frame);
            });
            
            setState(prev => ({
                ...prev,
                progress: Math.round(((i + 1) / captureResult.frames.length) * 50) + 50,
                phase: `Encoding frame ${i + 1}/${captureResult.frames.length}`,
            }));
            
            await new Promise(resolve => setTimeout(resolve, 1000 / captureResult.fps));
        }

        await new Promise<void>((resolve) => {
            mediaRecorder.onstop = () => resolve();
            mediaRecorder.stop();
        });

        return new Blob(chunks, { type: 'video/webm' });
    }, []);

    /**
     * Start the export process.
     * 
     * Captures frames from the animation and exports as WebM video using MediaRecorder API.
     * Falls back to GIF for Safari/iOS.
     */
    const startExport = useCallback(async (format: ExportFormat = 'auto') => {
        // Validate project first
        const validation = validateExport();
        if (!validation.valid) {
            setState({
                status: 'error',
                progress: 0,
                error: validation.error || 'Export validation failed',
                phase: '',
            });
            return;
        }

        if (!stageRef.current) {
            setState({
                status: 'error',
                progress: 0,
                error: 'Canvas not ready for export',
                phase: '',
            });
            return;
        }

        // Determine actual format to use
        let actualFormat: 'webm' | 'gif' = format === 'auto' 
            ? (browserInfo.supportsWebM ? 'webm' : 'gif')
            : (format === 'gif' ? 'gif' : 'webm');

        // Force GIF for Safari/iOS if auto
        if (format === 'auto' && (browserInfo.isSafari || browserInfo.isIOS)) {
            actualFormat = 'gif';
        }

        setState({
            status: 'preparing',
            progress: 0,
            error: null,
            phase: 'Preparing export...',
            format: actualFormat,
        });

        // Start frame capture for export
        const resolution = project?.settings?.exportResolution || '720p';
        
        setState(prev => ({
            ...prev,
            status: 'capturing',
            phase: 'Capturing frames...',
        }));

        const captureResult = await frameCapture.captureFrames(resolution);
        
        if (!captureResult) {
            setState({
                status: 'error',
                progress: 0,
                error: 'Frame capture failed',
                phase: '',
            });
            return;
        }

        setState(prev => ({
            ...prev,
            status: 'encoding',
            progress: 50,
            phase: `Encoding as ${actualFormat.toUpperCase()}...`,
        }));

        try {
            let outputBlob: Blob;
            let fileExtension: string;

            if (actualFormat === 'gif') {
                outputBlob = await exportAsGif(captureResult);
                fileExtension = 'gif';
            } else {
                outputBlob = await exportAsWebM(captureResult);
                fileExtension = 'webm';
            }
            
            // Download the file
            const url = URL.createObjectURL(outputBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `animation-${Date.now()}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setState({
                status: 'complete',
                progress: 100,
                error: null,
                phase: 'Export complete',
                fileSize: outputBlob.size,
                format: actualFormat,
            });
        } catch (error) {
            setState({
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Export failed',
                phase: '',
            });
        }
    }, [validateExport, stageRef, frameCapture, browserInfo, exportAsGif, exportAsWebM, project?.settings?.exportResolution]);

    /**
     * Cancel an in-progress export
     */
    const cancelExport = useCallback(() => {
        setState({
            status: 'idle',
            progress: 0,
            error: null,
            phase: 'Cancelled',
        });
    }, []);

    return {
        // State
        exportStatus: state.status,
        exportProgress: state.progress,
        exportError: state.error,
        exportPhase: state.phase,
        fileSize: state.fileSize,
        exportFormat: state.format,

        // Actions
        startExport,
        cancelExport,

        // Computed
        canExport: project !== null && project.frames.length >= 2,
        isExporting: state.status !== 'idle' && state.status !== 'complete' && state.status !== 'error',

        // Browser info
        browserInfo,
        recommendedFormat: recommendedFormat.format,
        formatReason: recommendedFormat.reason,

        // Export settings info
        get exportSettings() {
            const currentResolution = project?.settings?.exportResolution || '720p';
            const dimensions = VALIDATION.EXPORT.RESOLUTIONS[currentResolution as keyof typeof VALIDATION.EXPORT.RESOLUTIONS];
            return {
                width: dimensions.width,
                height: dimensions.height,
                fps: 30,
            };
        },
    };
}
