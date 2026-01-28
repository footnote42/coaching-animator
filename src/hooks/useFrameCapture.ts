import { useCallback, useRef, useState } from 'react';
import Konva from 'konva';
import { useProjectStore } from '../store/projectStore';
import { VALIDATION } from '../constants/validation';

/**
 * Export settings for MP4 video - dynamically configured based on resolution
 */
function getExportSettings(resolution: '720p' | '1080p') {
    const dimensions = VALIDATION.EXPORT.RESOLUTIONS[resolution];
    return {
        width: dimensions.width,
        height: dimensions.height,
        fps: 30,
        // CRF 22 for good quality/size balance
        crf: 22,
        // Keyframe every 1 second (30 frames at 30fps)
        gopSize: 30,
    } as const;
}

export interface FrameCaptureResult {
    frames: Blob[];
    fps: number;
    width: number;
    height: number;
    totalDuration: number; // in seconds
}

export interface FrameCaptureState {
    isCapturing: boolean;
    progress: number; // 0-100
    error: string | null;
    frameCount: number;
}

/**
 * Hook to capture animation frames from Konva stage for video encoding.
 * 
 * Captures frames at 30fps during animation playback at 1280x720 resolution.
 * Frames are stored as PNG blobs for ffmpeg input.
 */
export function useFrameCapture(stageRef: React.RefObject<Konva.Stage | null>) {
    const [state, setState] = useState<FrameCaptureState>({
        isCapturing: false,
        progress: 0,
        error: null,
        frameCount: 0,
    });

    const cancelledRef = useRef(false);
    const framesRef = useRef<Blob[]>([]);

    const project = useProjectStore((state) => state.project);

    /**
     * Capture all animation frames by stepping through the animation manually.
     * This avoids real-time playback timing issues and provides consistent frame capture.
     */
    const captureFrames = useCallback(async (resolution: '720p' | '1080p' = '720p'): Promise<FrameCaptureResult | null> => {
        if (!stageRef.current || !project) {
            setState(prev => ({ ...prev, error: 'Canvas or project not ready' }));
            return null;
        }

        const stage = stageRef.current;
        const frames = project.frames;

        if (frames.length < 2) {
            setState(prev => ({ ...prev, error: 'At least 2 frames required for export' }));
            return null;
        }

        // Get export settings based on resolution
        const exportSettings = getExportSettings(resolution);

        // Calculate total animation duration and frame count
        const totalDurationMs = frames.reduce((sum, frame) => sum + frame.duration, 0);
        const totalDurationSeconds = totalDurationMs / 1000;
        const totalVideoFrames = Math.ceil(totalDurationSeconds * exportSettings.fps);

        // Reset state
        cancelledRef.current = false;
        framesRef.current = [];
        setState({
            isCapturing: true,
            progress: 0,
            error: null,
            frameCount: 0,
        });

        // Store original stage dimensions
        const originalWidth = stage.width();
        const originalHeight = stage.height();
        const originalScale = stage.scale();

        try {
            // Resize stage to export resolution
            stage.width(exportSettings.width);
            stage.height(exportSettings.height);
            stage.scale({
                x: exportSettings.width / 2000,
                y: exportSettings.height / 2000,
            });

            const capturedFrames: Blob[] = [];

            // Capture frames by stepping through animation time
            for (let videoFrame = 0; videoFrame < totalVideoFrames; videoFrame++) {
                if (cancelledRef.current) {
                    throw new Error('Export cancelled');
                }

                // Calculate current time in animation
                const currentTimeMs = (videoFrame / exportSettings.fps) * 1000;

                // Find which animation frame we're in and the interpolation progress
                let accumulatedTime = 0;
                let currentFrameIndex = 0;
                let interpolationProgress = 0;

                for (let i = 0; i < frames.length - 1; i++) {
                    const frameEndTime = accumulatedTime + frames[i].duration;
                    if (currentTimeMs < frameEndTime) {
                        currentFrameIndex = i;
                        interpolationProgress = (currentTimeMs - accumulatedTime) / frames[i].duration;
                        break;
                    }
                    accumulatedTime = frameEndTime;
                    currentFrameIndex = i + 1;
                }

                // Set the store state for rendering (this will trigger entity interpolation)
                const store = useProjectStore.getState();
                store.setCurrentFrame(currentFrameIndex);
                store.setPlaybackPosition({
                    fromFrameIndex: currentFrameIndex,
                    toFrameIndex: Math.min(currentFrameIndex + 1, frames.length - 1),
                    progress: Math.min(interpolationProgress, 1),
                });

                // Allow React to render the frame
                await new Promise(resolve => setTimeout(resolve, 0));
                stage.batchDraw();

                // Capture frame as PNG blob
                const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                capturedFrames.push(blob);

                // Update progress
                const progress = Math.round(((videoFrame + 1) / totalVideoFrames) * 100);
                setState(prev => ({
                    ...prev,
                    progress,
                    frameCount: capturedFrames.length,
                }));
            }

            framesRef.current = capturedFrames;

            // Restore original stage dimensions
            stage.width(originalWidth);
            stage.height(originalHeight);
            stage.scale(originalScale || { x: 1, y: 1 });
            stage.batchDraw();

            // Reset playback state
            const store = useProjectStore.getState();
            store.setCurrentFrame(0);
            store.setPlaybackPosition({
                fromFrameIndex: 0,
                toFrameIndex: 0,
                progress: 0,
            });

            setState(prev => ({
                ...prev,
                isCapturing: false,
                progress: 100,
            }));

            return {
                frames: capturedFrames,
                fps: exportSettings.fps,
                width: exportSettings.width,
                height: exportSettings.height,
                totalDuration: totalDurationSeconds,
            };

        } catch (error) {
            // Restore original stage dimensions on error
            stage.width(originalWidth);
            stage.height(originalHeight);
            stage.scale(originalScale || { x: 1, y: 1 });
            stage.batchDraw();

            const errorMessage = error instanceof Error ? error.message : 'Frame capture failed';
            setState(prev => ({
                ...prev,
                isCapturing: false,
                error: errorMessage,
            }));

            return null;
        }
    }, [stageRef, project]);

    /**
     * Cancel an in-progress capture
     */
    const cancel = useCallback(() => {
        cancelledRef.current = true;
    }, []);

    return {
        ...state,
        captureFrames,
        cancel,
    };
}
