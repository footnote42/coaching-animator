import { useCallback, useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { useProjectStore } from '../store/projectStore';
import { ExportStatus } from '../types';

/**
 * Hook to manage video export using MediaRecorder API
 * 
 * Captures the Konva Stage during playback and generates a downloadable .webm video.
 * Manages export state machine: idle → preparing → recording → processing → complete (or error)
 */
export function useExport(stageRef: React.RefObject<Konva.Stage>) {
    const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
    const [exportProgress, setExportProgress] = useState<number>(0);
    const [exportError, setExportError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const project = useProjectStore((state) => state.project);
    const currentFrameIndex = useProjectStore((state) => state.currentFrameIndex);
    const setCurrentFrame = useProjectStore((state) => state.setCurrentFrame);
    const play = useProjectStore((state) => state.play);

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
     * Download the video blob
     */
    const downloadVideo = useCallback((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.name || 'animation'}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [project]);

    /**
     * Clean up MediaRecorder and recorded data
     */
    const cleanup = useCallback(() => {
        if (mediaRecorderRef.current) {
            try {
                if (mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                }
            } catch (error) {
                console.error('Error stopping MediaRecorder:', error);
            }
            mediaRecorderRef.current = null;
        }
        recordedChunksRef.current = [];
    }, []);

    /**
     * Start the export process
     */
    const startExport = useCallback(async () => {
        // Validate
        const validation = validateExport();
        if (!validation.valid) {
            setExportStatus('error');
            setExportError(validation.error || 'Export validation failed');
            return;
        }

        if (!stageRef.current) {
            setExportStatus('error');
            setExportError('Canvas not ready for export');
            return;
        }

        try {
            // Phase 1: Preparing
            setExportStatus('preparing');
            setExportProgress(10);
            setExportError(null);
            cleanup();

            // Reset to frame 0
            if (currentFrameIndex !== 0) {
                setCurrentFrame(0);
                await new Promise(resolve => setTimeout(resolve, 100)); // Allow frame to update
            }

            // Phase 2: Recording
            setExportStatus('recording');
            setExportProgress(20);

            // Get the Konva Stage
            const stage = stageRef.current;

            // Determine export dimensions based on project settings
            const exportResolution = project!.settings.exportResolution;
            const dimensions = exportResolution === '1080p'
                ? { width: 1920, height: 1080 }
                : { width: 1280, height: 720 };

            // Store original stage dimensions and scale
            const originalWidth = stage.width();
            const originalHeight = stage.height();
            const originalScale = stage.scale();

            // Temporarily resize and scale the stage for export
            // Assuming the stage's native coordinate system is 2000x2000
            stage.width(dimensions.width);
            stage.height(dimensions.height);
            stage.scale({
                x: dimensions.width / 2000,
                y: dimensions.height / 2000
            });

            // Force stage to redraw with new dimensions
            stage.batchDraw();

            // Get the canvas element from Konva Stage with new resolution
            const canvas = stage.toCanvas();

            // Create MediaStream from canvas
            const stream = canvas.captureStream(60); // 60 FPS

            // Setup MediaRecorder
            recordedChunksRef.current = [];

            // Find supported mime type
            const mimeTypes = [
                'video/webm;codecs=vp8,opus',
                'video/webm;codecs=vp8',
                'video/webm',
            ];
            const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

            const options: MediaRecorderOptions = {
                mimeType,
                videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
            };

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Stop all tracks in the stream to release resources (camera, mic, or canvas capture)
                stream.getTracks().forEach(track => track.stop());

                // Restore original stage dimensions and scale
                stage.width(originalWidth);
                stage.height(originalHeight);
                stage.scale(originalScale || { x: 1, y: 1 });
                stage.batchDraw();

                setExportStatus('processing');
                setExportProgress(80);

                // Create blob from recorded chunks
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

                // Download the video
                downloadVideo(blob);

                setExportStatus('complete');
                setExportProgress(100);

                // Reset to idle after 2 seconds
                setTimeout(() => {
                    setExportStatus('idle');
                    setExportProgress(0);
                }, 2000);

                cleanup();
            };

            mediaRecorder.onerror = (event) => {
                // Stop all tracks in the stream
                stream.getTracks().forEach(track => track.stop());

                // Restore original stage dimensions and scale on error
                stage.width(originalWidth);
                stage.height(originalHeight);
                stage.scale(originalScale || { x: 1, y: 1 });
                stage.batchDraw();

                console.error('MediaRecorder error:', event);
                setExportStatus('error');
                setExportError('Recording failed. Please try again.');
                cleanup();
            };

            // Start recording
            mediaRecorder.start(100); // Capture data every 100ms

            // Update progress slightly
            setExportProgress(30);

            // Start playback
            play();

            // Monitor playback and update progress
            const checkPlayback = setInterval(() => {
                const store = useProjectStore.getState();

                if (!store.isPlaying) {
                    // Animation finished
                    clearInterval(checkPlayback);

                    // Stop recording after a short delay to ensure last frame is captured
                    setTimeout(() => {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            mediaRecorderRef.current.stop();
                        }
                    }, 500);
                } else {
                    // Update progress based on current frame
                    const progress = 30 + ((store.currentFrameIndex / (project!.frames.length - 1)) * 40);
                    setExportProgress(Math.min(progress, 70));
                }
            }, 100);

        } catch (error) {
            // Restore original dimensions if they were set
            if (stageRef.current) {
                const stage = stageRef.current;
                // Check if we have originalWidth variable in scope (we might not if error happened early)
                try {
                    stage.scale({ x: 1, y: 1 });
                    stage.batchDraw();
                } catch (restoreError) {
                    // Ignore restore errors
                }
            }

            console.error('Export error:', error);
            setExportStatus('error');
            setExportError(error instanceof Error ? error.message : 'Export failed');
            cleanup();
        }
    }, [validateExport, stageRef, currentFrameIndex, setCurrentFrame, play, downloadVideo, cleanup, project]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        exportStatus,
        exportProgress,
        exportError,
        startExport,
        canExport: project !== null && project.frames.length >= 2,
    };
}
