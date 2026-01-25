import { useCallback, useState } from 'react';
import Konva from 'konva';
import { useProjectStore } from '../store/projectStore';
import { EXPORT_SETTINGS } from './useFrameCapture';

// TODO: [GIF-MIGRATION] FFmpeg has been removed. Export is temporarily disabled.
// Phase 2-4 of gif-export-plan.md will implement GIF export using gif.js.
// This file will be updated in Phase 4 (useExport Integration) to use the new useGifExport hook.
//
// Original imports that were removed:
// - import { useFrameCapture } from './useFrameCapture';
// - import { useMp4Export } from './useMp4Export';

export type ExportStatus = 'idle' | 'preparing' | 'capturing' | 'encoding' | 'complete' | 'error';

export interface ExportState {
    status: ExportStatus;
    progress: number; // 0-100
    error: string | null;
    phase: string;
    fileSize?: number;
}

/**
 * Hook to manage animation export.
 *
 * TODO: [GIF-MIGRATION] Currently disabled during FFmpeg -> gif.js migration.
 * Phase 4 of gif-export-plan.md will integrate the new useGifExport hook here.
 *
 * Original: Exported animation as H.264 MP4 at 720p/30fps via FFmpeg.wasm
 * Future: Will export as GIF using gif.js for better browser compatibility.
 */
export function useExport(stageRef: React.RefObject<Konva.Stage | null>) {
    const [state, setState] = useState<ExportState>({
        status: 'idle',
        progress: 0,
        error: null,
        phase: '',
    });

    const project = useProjectStore((state) => state.project);

    // TODO: [GIF-MIGRATION] Phase 4 will add:
    // const gifExport = useGifExport(stageRef);

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
     * Start the export process.
     *
     * TODO: [GIF-MIGRATION] This function is temporarily disabled.
     * Phase 4 of gif-export-plan.md will implement: capture frames -> encode to GIF -> download
     * Original flow was: capture frames -> encode to MP4 via FFmpeg -> download
     */
    const startExport = useCallback(async () => {
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

        // TODO: [GIF-MIGRATION] Export temporarily disabled during migration.
        // This entire block will be replaced with GIF export logic in Phase 4.
        // The useGifExport hook will handle: frame capture -> GIF encoding -> download
        setState({
            status: 'error',
            progress: 0,
            error: 'Export temporarily unavailable. GIF export coming soon!',
            phase: '',
        });
    }, [validateExport, stageRef]);

    /**
     * Cancel an in-progress export
     *
     * TODO: [GIF-MIGRATION] Phase 4 will call gifExport.cancel() here
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

        // Actions
        startExport,
        cancelExport,

        // Computed
        canExport: project !== null && project.frames.length >= 2,
        isExporting: state.status !== 'idle' && state.status !== 'complete' && state.status !== 'error',

        // Export settings info (kept for Phase 4 compatibility)
        exportSettings: EXPORT_SETTINGS,
    };
}
