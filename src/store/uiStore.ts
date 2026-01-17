import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    SidebarPanel,
    ExportStatus,
    PendingAction,
    ExportResult
} from '../types';

export interface UIStoreState {
    selectedEntityId: string | null;
    showGhosts: boolean;
    showGrid: boolean;
    activeSidebarPanel: SidebarPanel;
    exportDialog: {
        isOpen: boolean;
        progress: number;
        status: ExportStatus;
        error?: string;
    };
    unsavedChangesDialog: {
        isOpen: boolean;
        pendingAction: PendingAction | null;
    };

    selectEntity: (entityId: string | null) => void;
    deselectAll: () => void;
    toggleGhosts: () => void;
    toggleGrid: () => void;
    setSidebarPanel: (panel: SidebarPanel) => void;
    startExport: () => void;
    setExportProgress: (progress: number) => void;
    completeExport: (result: ExportResult) => void;
    closeExportDialog: () => void;
    showUnsavedChangesDialog: (pendingAction: PendingAction) => void;
    confirmPendingAction: () => void;
    cancelPendingAction: () => void;
}

export const useUIStore = create<UIStoreState>()(
    devtools(
        (set) => ({
            selectedEntityId: null,
            showGhosts: false,
            showGrid: false,
            activeSidebarPanel: 'entities',
            exportDialog: {
                isOpen: false,
                progress: 0,
                status: 'idle',
            },
            unsavedChangesDialog: {
                isOpen: false,
                pendingAction: null,
            },

            selectEntity: (entityId: string | null) => set((state) => ({
                ...state,
                selectedEntityId: entityId,
            })),
            deselectAll: () => set((state) => ({
                ...state,
                selectedEntityId: null,
            })),
            toggleGhosts: () => set((state) => ({
                ...state,
                showGhosts: !state.showGhosts,
            })),
            toggleGrid: () => set((state) => ({
                ...state,
                showGrid: !state.showGrid,
            })),
            setSidebarPanel: (panel: SidebarPanel) => set((state) => ({
                ...state,
                activeSidebarPanel: panel,
            })),
            startExport: () => set((state) => ({
                ...state,
                exportDialog: {
                    ...state.exportDialog,
                    isOpen: true,
                    progress: 0,
                    status: 'preparing',
                },
            })),
            setExportProgress: (progress: number) => set((state) => ({
                ...state,
                exportDialog: {
                    ...state.exportDialog,
                    progress,
                },
            })),
            completeExport: (result: ExportResult) => set((state) => ({
                ...state,
                exportDialog: {
                    ...state.exportDialog,
                    status: result.success ? 'complete' : 'error',
                    error: result.error,
                },
            })),
            closeExportDialog: () => set((state) => ({
                ...state,
                exportDialog: {
                    isOpen: false,
                    progress: 0,
                    status: 'idle',
                },
            })),
            showUnsavedChangesDialog: (pendingAction: PendingAction) => set((state) => ({
                ...state,
                unsavedChangesDialog: {
                    isOpen: true,
                    pendingAction,
                },
            })),
            confirmPendingAction: () => set((state) => ({
                ...state,
                unsavedChangesDialog: {
                    isOpen: false,
                    pendingAction: null,
                },
            })),
            cancelPendingAction: () => set((state) => ({
                ...state,
                unsavedChangesDialog: {
                    isOpen: false,
                    pendingAction: null,
                },
            })),
        }),
        { name: 'UIStore' }
    )
);
